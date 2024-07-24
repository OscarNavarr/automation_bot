/*
const div_container = document.querySelectorAll("div.text")

const etude_name = [];
const etude_address = [];

div_container.forEach((div_element)=>{
    etude_name.push(div_element.children[0].innerText);
    etude_address.push(div_element.children[1].innerText);
});
*/

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request) {

    // Get the URL from the query string
    const { searchParams } = new URL(request.url);                  
    const url = searchParams.get('url'); 
    
    if (!url) {
        return NextResponse.json({ message: 'Falta la URL en la consulta' }, { status: 400 });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        // Wait for the "lawyer-info" links to appear
        await page.waitForSelector('div.text', { timeout: 30000 });

        // Get the filtered links
        const data = await page.evaluate(async () => {
            const div_container = document.querySelectorAll("div.text")

            const results = [];

            div_container.forEach((div_element)=>{
                results.push({ etude_name: div_element.children[0].innerText.trim(), etude_address:  div_element.children[1].innerText.replace(' Disponible pour rendez-vous en ligne', '').trim() });
            });

            return results;
        });

        await browser.close();

        return NextResponse.json({ data });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error al extraer datos' }, { status: 500 });
    }
}
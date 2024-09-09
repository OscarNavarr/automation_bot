import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ message: 'Falta la URL en la consulta' }, { status: 400 });
    }

    let browser;
    try {
        
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });


        await page.waitForSelector('div.address-block', { timeout: 30000 });
        
        const newAddresses = []; 

        const adresse_etude = await page.evaluate(() => {
            return document.querySelector('div.address-block').textContent.trim();
        });

        newAddresses.push(adresse_etude);

        // Cerrar el navegador
        await browser.close();

        // Devolver los datos extraídos
        return NextResponse.json({ data: { newAddresses} });


    } catch (error) {
        console.error(error);
        if (browser) {
            await browser.close();
        }
        return NextResponse.json({ message: 'Error al extraer datos' }, { status: 500 });
    }

}
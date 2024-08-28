import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request){

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if(!url){
        return NextResponse.json({ message: 'Falta la URL en la consulta' }, { status: 400 });
    }
    
    try {
        
        const browser = await puppeteer.launch({ headless: true});
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        // Wait for the "h3.tg-highlight" links to appear
        await page.waitForSelector('h3.tg-highlight', { timeout: 30000 });

        // Get the filtered h3
        const data = await page.evaluate(async () => {
            const text = document.querySelectorAll("h3.tg-highlight")

            const results = [];
            text.forEach(element => {

                results.push({ text: element.textContent.trim() });

            })
            
            return results;
        })

        await browser.close();

        return NextResponse.json({ data }); 

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error al extraer datos', errors: error }, { status: 500 });
    }

}
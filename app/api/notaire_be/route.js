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
        // Iniciar Puppeteer
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Esperar a que aparezcan los enlaces
        await page.waitForSelector('a.info-content-blocklink', { timeout: 30000 });

        // Obtener los enlaces y los nombres de los estudios
        const data = await page.evaluate(() => {
            const links = document.querySelectorAll('a.info-content-blocklink');
            const hrefs = Array.from(links).map(link => link.href);
            const nom_etude = Array.from(links).map(link => link.querySelector('div.text>h3').innerText);
            return { hrefs, nom_etude };
        });

        const { hrefs, nom_etude } = data;


        // Cerrar el navegador
        await browser.close();

        // Devolver los datos extraídos
        return NextResponse.json({ data: { hrefs, nom_etude} });

    } catch (error) {
        console.error(error);
        if (browser) {
            await browser.close();
        }
        return NextResponse.json({ message: 'Error al extraer datos' }, { status: 500 });
    }
}

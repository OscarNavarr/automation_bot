import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ message: 'Falta la URL en la consulta' }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
      const links = document.querySelectorAll('a.link--extended.before\\:z-10');
      const results = [];

      links.forEach(link => {
        const grandParent = link.parentElement?.parentElement;
        if (grandParent) {
          const address = grandParent.querySelector('address');
          if (address) {
            results.push({
              notaryName: link.textContent.trim(),
              address: address.textContent.trim()
            });
          }
        }
      });

      return results;
    });

    await browser.close();

    // Eliminar duplicados
    const uniqueData = [];
    const seen = new Set();
    
    for (const item of data) {
      const identifier = `${item.notaryName}-${item.address}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueData.push(item);
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al extraer datos' }, { status: 500 });
  }
}

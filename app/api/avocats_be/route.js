import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request) {
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
    await page.waitForSelector('a.lawyer-info', { timeout: 30000 });

    // Get the filtered links
    const data = await page.evaluate(async () => {
      const links = document.querySelectorAll('a.lawyer-info');
      const filteredLinks = Array.from(links).filter(link => link.textContent.trim() !== 'Voir les détails');

      const results = [];
      for (const link of filteredLinks) {
        link.click(); // Emulate click to open the modal
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for modal to open

        const pElement = document.querySelector('ul.cabinet-address p');
        let textContent = pElement ? pElement.textContent.trim() : null;

        // Replace the "Ouvrir map" text with an empty string if it exists in the textContent
        if (textContent) {
          textContent = textContent.replace('Ouvrir map', '').trim();
        }

        results.push({ linkText: link.textContent.trim(), text: textContent });

        // Close the modal if necessary (this part depends on how the modal is closed on the actual site)
        const closeButton = document.querySelector('a.close-btn.lawyer-toggler'); // Adjust the selector as needed
        if (closeButton) {
          closeButton.click();
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for modal to close
        }
      }

      return results;
    });

    await browser.close();

    return NextResponse.json({ data });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al extraer datos' }, { status: 500 });
  }
}

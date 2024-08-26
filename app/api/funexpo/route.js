import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request) {

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");


    if (!url) {
        return NextResponse.json({ message: "Falta la URL en la consulta" }, { status: 400 });
    }

    try {
        
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

        // Wait for the "fullwidth" links to appear
        await page.waitForSelector("div.fullwidth", { timeout: 30000 });

        // Get the h3 tags that have a strong tag inside
        const data = await page.evaluate(async () => {
            const strongText = document.querySelectorAll("div.fullwidth h3 strong");

            const results = [];
            for (const text of strongText) {
                results.push({ text: text.textContent.trim() });
            }
            return results;

        });

        await browser.close();

        return NextResponse.json({ data });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al extraer datos" }, { status: 500 });
        
    }
}
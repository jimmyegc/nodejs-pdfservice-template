const chromium = require("chrome-aws-lambda");

let puppeteer;
if (process.env.NETLIFY) {
  puppeteer = chromium.puppeteer;
} else {
  puppeteer = require("puppeteer");
}

exports.handler = async (event) => {
  // Verifica método POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  try {
    const { html, url } = JSON.parse(event.body || "{}");

    if (!html && !url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Debes enviar 'html' o 'url'" }),
      };
    }

    const browser = await puppeteer.launch(
      process.env.NETLIFY
        ? {
            executablePath: await chromium.executablePath,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            headless: chromium.headless,
          }
        : { headless: true }
    );

    const page = await browser.newPage();

    if (url) await page.goto(url, { waitUntil: "networkidle0" });
    else await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=document.pdf",
      },
      isBase64Encoded: true,
      body: pdfBuffer.toString("base64"),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

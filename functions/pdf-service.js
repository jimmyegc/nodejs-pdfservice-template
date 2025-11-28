const PDFDocument = require("pdfkit");
const { Buffer } = require("buffer");

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Debes enviar 'text'" }),
      };
    }

    // Crear PDF
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    doc.fontSize(18).text(text, { align: "center" });
    doc.end();

    // Esperar a que termine
    const pdfBuffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

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

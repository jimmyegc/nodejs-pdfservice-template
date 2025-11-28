const pdf = require("html-pdf-node");

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
    const { html } = JSON.parse(event.body || "{}");

    if (!html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Debes enviar 'html'" }),
      };
    }

    // Objeto para html-pdf-node
    const options = { format: "A4" };
    const file = { content: html };

    const pdfBuffer = await pdf.generatePdf(file, options);

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

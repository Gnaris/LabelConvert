const axios = require("axios")
const { PDFDocument } = require("pdf-lib");
const fs = require("fs")
const { PDFParse } = require('pdf-parse');

async function convertLabel(url, message) {

    const response = await axios.get(url, { responseType: "arraybuffer" });

    const pdfDoc = await PDFDocument.load(response.data);
    const newPdf = await PDFDocument.create();

    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);

    const { width, height } = firstPage.getSize();
    firstPage.setCropBox(0, 0, width / 2, height);

    newPdf.addPage(firstPage);

    const newPdfBytes = await newPdf.save();

    const filePath = "./bordereau_converti.pdf";
    fs.writeFileSync(filePath, newPdfBytes);

    const parser = new PDFParse({ url: url });
    const result = await parser.getText();
    const resultSplit = result.text.split("\n")
    const destinataire = resultSplit[23]
    const suivi = resultSplit[33]

    await message.reply({
        content: destinataire + " - " + suivi,
        files: [filePath],
    });
    fs.unlinkSync(filePath);
}

module.exports = { convertLabel }
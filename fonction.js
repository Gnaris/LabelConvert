const axios = require("axios")
const { PDFDocument } = require("pdf-lib");
const fs = require("fs")
const { PDFParse } = require('pdf-parse');

async function convertLabel(url, message, iteration) {

    const response = await axios.get(url, { responseType: "arraybuffer" });

    const pdfDoc = await PDFDocument.load(response.data);
    const newPdf = await PDFDocument.create();

    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    firstPage.setCropBox(55.5, 163.5, 286, 342); // gauche, bas, droite, haut
    newPdf.addPage(firstPage);

    const newPdfBytes = await newPdf.save();

    // l'itération c'est pour éviter que le gars envois plusieurs bordereau d'un coup et que ça créer un conflit de fichier
    const filePath = "./bordereau_converti" + iteration + ".pdf";
    fs.writeFileSync(filePath, newPdfBytes);

    const parser = new PDFParse({ url: url });
    const result = await parser.getText();
    let resultSplit = result.text.split("\n")
    let destinaire = resultSplit[23];
    let suivi;
    resultSplit.forEach(text => {
        if (text.replace(/\s+/g, '').match(/\b8[A-Z]\d{11,}\b/g)) // enlève tout les espaces puis check si ça correspond au format du numéro suivi attendu
        {
            suivi = text.replace(/\s+/g, '')
        }
    })

    await message.reply({
        content: destinaire + " - " + suivi,
        files: [filePath],
    });

    fs.unlinkSync(filePath)
}

module.exports = { convertLabel }
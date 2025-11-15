const axios = require("axios")
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs")
const { PDFParse } = require('pdf-parse');

async function convertLabel(message) {
    i = 1;
    for (const attachment of message.attachments.values()) {
        const response = await axios.get(attachment.url, { responseType: "arraybuffer" });

        const pdfDoc = await PDFDocument.load(response.data);
        
        const newPdf = await PDFDocument.create();
        const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
        firstPage.setCropBox(45, 155, 307, 360); // gauche, bas, droite, haut
        newPdf.addPage(firstPage);

        const productName = message.channel.name.split("____")[0].split("-").map(m => m.slice(0, 4)).join("-")

        newPdf.getPages()[0].drawText(productName + " " + (message.content ? message.content : "x1"), {
            x: firstPage.getCropBox().width - 210,
            y: firstPage.getCropBox().height + 50,
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 1,
        })

        const newPdfBytes = await newPdf.save()

        // l'itération c'est pour éviter que le gars envois plusieurs bordereau d'un coup et que ça créer un conflit de fichier
        const filePath = "./label-" + productName + "-" + i + ".pdf";
        fs.writeFileSync("./labels/" + filePath, newPdfBytes);

        const parser = new PDFParse({ url : "./labels/" + filePath});
        const result = await parser.getText();
        const resultSplit = result.text.split("\n")
        let destinaire = resultSplit[8]
        let suivi;
        resultSplit.forEach(text => {
            if (text.replace(/\s+/g, '').match(/\b8[A-Z]\d{11,}\b/g)) // enlève tout les espaces puis check si ça correspond au format du numéro suivi attendu
            {
                suivi = text.replace(/\s+/g, '')
            }
        })

        await message.reply({
            content: "# " + suivi + "\n" + destinaire + (message.content && "\n" + "# --> [ " + message.content + " ] <--"),
            files: ["./labels/" + filePath],
        });

        fs.unlinkSync("./labels/" + filePath)

        message.delete()
    }
}

async function regroupLabel(interaction) {
    const messages = await interaction.channel.messages.fetch({ limit: 100 })
    const pdfUrl = []
    messages.forEach((message) => {
        if (message.attachments.size > 0 && !message.content.includes("bordereaux regroupés")) {
            message.attachments.forEach((attachment) => {
                if (attachment.name.endsWith('.pdf') && attachment.contentType == 'application/pdf') {
                    pdfUrl.push(attachment.url)
                }
            })
        }
    })

    const request = pdfUrl.map(url => axios.get(url, { responseType: "arraybuffer" }))
    const responses = await axios.all(request)
    const pdfGrouped = await PDFDocument.create()
    for (const response of responses) {
        const pdf = await PDFDocument.load(response.data);
        const pages = await pdfGrouped.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => pdfGrouped.addPage(page));
    }
    const pdfGroupedBytes = await pdfGrouped.save()
    const filePath = "./" + interaction.channel.name.split("____")[0] + "_groupés.pdf"
    fs.writeFileSync(filePath, pdfGroupedBytes)
    await interaction.editReply({
        content: "# **" + pdfGrouped.getPages().length + " bordereaux regroupés**",
        files: [filePath]
    })
    fs.unlinkSync(filePath)
}

async function countLabel(interaction) {
    let count = 0;
    const messages = await interaction.channel.messages.fetch({ limit: 100 })
    messages.forEach((message) => {
        if (message.attachments.size > 0 && !message.content.includes("bordereaux regroupés")) {
            message.attachments.forEach((attachment) => {
                if (attachment.name.endsWith('.pdf') && attachment.contentType == 'application/pdf') {
                    count++
                }
            })
        }
    })
    interaction.reply("# Total label : " + count)
}

module.exports = { convertLabel, regroupLabel, countLabel }
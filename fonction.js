const axios = require("axios")
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs")
const { PDFParse } = require('pdf-parse');

async function convertLabel(url, message, iteration, quantity = "") {

    const response = await axios.get(url, { responseType: "arraybuffer" });

    const pdfDoc = await PDFDocument.load(response.data);
    const newPdf = await PDFDocument.create();

    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    firstPage.setCropBox(45, 155, 307, 360); // gauche, bas, droite, haut
    newPdf.addPage(firstPage);

    newPdf.getPages()[0].drawText(quantity, {
        x: firstPage.getCropBox().width - 210,
        y: firstPage.getCropBox().height + 50,
        size: 10,
        color: rgb(0, 0, 0),
        opacity: 1,
    })

    const newPdfBytes = await newPdf.save()

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
        content: destinaire + "\n" + suivi + (quantity && "\n" + "# --> [ " + quantity + " ] <--"),
        files: [filePath],
    });

    fs.unlinkSync(filePath)
}

async function regroupLabel(interaction)
{
    const messages = await interaction.channel.messages.fetch({ limit: 100 })
    const messagesFilter = []
    messages.forEach((message) => {
        if(message.attachments.size > 0 && !message.content.includes("bordereaux regroupés"))
        {
            message.attachments.forEach((attachment) => {
                if(attachment.name.endsWith('.pdf') && attachment.contentType == 'application/pdf')
                {
                    messagesFilter.push(message)
                }
            })
        }
    })

    const pdfUrl = []
    messagesFilter.forEach((message) => {
        message.attachments.forEach((attachment) => {
            pdfUrl.push(attachment.url)
        })
    })
    const request = pdfUrl.map(url => axios.get(url, {responseType : "arraybuffer"}))
    const responses = await axios.all(request)
    const pdfGrouped = await PDFDocument.create()
    for (const response of responses) {
        const pdf = await PDFDocument.load(response.data);
        const pages = await pdfGrouped.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => pdfGrouped.addPage(page));
    }
    const pdfGroupedBytes = await pdfGrouped.save()
    const filePath = "./" + interaction.channel.name + "_groupés.pdf"
    fs.writeFileSync(filePath , pdfGroupedBytes)
    await interaction.editReply({
        content : "# **" + pdfGrouped.getPages().length + " bordereaux regroupés**",
        files : [filePath]
    })
    fs.unlinkSync(filePath)
}

async function countLabel(interaction)
{
    let count = 0;
    const messages = await interaction.channel.messages.fetch({ limit: 100 })
    messages.forEach((message) => {
        if(message.attachments.size > 0 && !message.content.includes("bordereaux regroupés"))
        {
            message.attachments.forEach((attachment) => {
                if(attachment.name.endsWith('.pdf') && attachment.contentType == 'application/pdf')
                {
                    count++
                }
            })
        }
    })   
    interaction.reply("# Total label : " + count)                 
}

module.exports = { convertLabel, regroupLabel, countLabel }
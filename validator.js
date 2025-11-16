const { removeAllEmoji } = require("./utils");

async function convertLabelValidator(message){
    if(removeAllEmoji(message.channel.name).split("_").filter(n => n != "").length != 2)
    {
        await message.reply({
            content :  "Renomme le nom du channel \n" +
            "Exemple : always-noir\\_an ( faut que tu mets un '\\_' (underscore) + un code qui sera utilisé pour mettre dans le label dans l'exemple j'ai mis 'an' mais tu peux mettre ce que tu veux",
            failIfNotExists: false
        })
        return false;
    };
    if(message.attachments.size <= 0) return false;
    if(!message.channel.parent) return false;
    if(!message.channel.parent.name.includes("asin")) return false;

    for(const attachment of message.attachments.values())
    {
        if(attachment.contentType !== 'application/pdf' || !attachment.name.endsWith(".pdf"))
        {
            return false
        }
    }

    return true;
}

module.exports = { convertLabelValidator }
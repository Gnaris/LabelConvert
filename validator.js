async function convertLabelValidator(message){
    if(message.author.bot) return false;
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

async function isAsinChannel(channel){
   if(!channel.parent) return false;
   if(!channel.parent.name.includes("asin")) return false;

   return true;
}

module.exports = { convertLabelValidator, isAsinChannel }
const { Client, GatewayIntentBits } = require('discord.js');
const { convertLabel } = require('./fonction');
const token = 'MTQzNTkzOTIxNzAwMjk5MTY1Ng.GQU3va.IDS-ard9szLH2vWWn5gtBchpjIG65NS-ktR8ns';
const clientId = '1435939217002991656';
const guildId = '1435940865397755990';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.on('messageCreate', async message => {
  console.log(message.content)
  if (message.author.bot) return;
  let i = 0;
  for (const attachment of message.attachments.values()) {
    if (attachment.size > 0 || attachment.contentType == 'application/pdf' || attachment.name.endsWith(".pdf"))
    {
      await convertLabel(attachment.url, message, i);
      i++
      if(i >= message.attachments.size)
      {
        message.delete()
      }
    }
  }
})

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`)
});
client.login(token);

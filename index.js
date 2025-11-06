const { Client, GatewayIntentBits } = require('discord.js');
const { convertLabel } = require('./fonction');
const token = 'MTQzNTkzOTIxNzAwMjk5MTY1Ng.GbBqif.adOXGiy13pqo2gj_Sdf8dfJGkIXbSscHlBGwZw';
const clientId = '1435939217002991656';
const guildId = '1435940865397755990';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.on('messageCreate', async message => {
  if(message.author.bot) return;
  message.attachments.forEach(attachment => {
    if(attachment.size < 0 || attachment.contentType != 'application/pdf' || !attachment.name.endsWith(".pdf")) return;
    convertLabel(attachment.url, message)
  })

})

client.once('ready', () => console.log(`Connecté en tant que ${client.user.tag}`));
client.login(token);

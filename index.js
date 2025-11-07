const { Client, GatewayIntentBits, SlashCommandBuilder, Collection, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { convertLabel, regroupLabel, countLabel } = require('./fonction');
const token = 'MTQzNTkzOTIxNzAwMjk5MTY1Ng.GQU3va.IDS-ard9szLH2vWWn5gtBchpjIG65NS-ktR8ns';
const clientId = '1435939217002991656';
const guildIds = [
  "1435940865397755990",
  "1435294428930768958"
]

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
try {
  const commands = [
    new SlashCommandBuilder().setName("group").setDescription("Regroupe les PDF de ce channel en un seul fichier PDF").toJSON(),
    new SlashCommandBuilder().setName("count").setDescription("Il va compter combien de bordereaux il y a dans ce channel").toJSON(),
  ]

  const rest = new REST({ version: "10" }).setToken(token)
  for (const guildId of guildIds) {
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  }
} catch (err) {
  console.log(err)
}

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName == "group") {
        interaction.deferReply()
        await regroupLabel(interaction)
      }
      if (interaction.commandName == "count") {
        await countLabel(interaction)
      }
    }
  } catch (err) {
    console.log(err)
  }
  return;
})


client.on('messageCreate', async message => {
  if (message.author.bot) return;
  try {
    let i = 0;
    for (const attachment of message.attachments.values()) {
      if (attachment.size > 0 || attachment.contentType == 'application/pdf' || attachment.name.endsWith(".pdf")) {
        await convertLabel(attachment.url, message, i, message.content);
        i++
        if (i >= message.attachments.size) {
          message.delete()
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
})

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`)
});
client.login(token);

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { convertLabel, regroupLabel, countLabel } = require('./fonction');
const { convertLabelValidator, isAsinChannel } = require('./validator');
const fs = require("fs")
const token = '';
const clientId = '';
const guildIds = [""]

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
  try {
    if (!await convertLabelValidator(message)) return;
    await convertLabel(message);
  } catch (err) {
    console.log(err)
  }
})

client.on('channelCreate', async (channel) => {
  try {
    if (!await isAsinChannel(channel)) return;
    await channel.setName(channel.name + "____" + channel.name.split("-").map(m => m.slice(0, 4)).join("-"))
  } catch (err) {
    console.log(err)
  }
})

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`)
  fs.mkdirSync("./labels", { recursive: true })
});
client.login(token); 

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js')
const { convertLabel, regroupLabel, countLabel } = require('./fonction')
const { convertLabelValidator } = require('./validator')
const fs = require("fs")
const token = ''
const clientId = '1439020023636033831'
const guildId = "1435294428930768958"

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
try {
  const commands = [
    new SlashCommandBuilder().setName("group").setDescription("Regroupe les PDF de ce channel en un seul fichier PDF").toJSON(),
    new SlashCommandBuilder().setName("count").setDescription("Il va compter combien de bordereaux il y a dans ce channel").toJSON(),
  ]

  const rest = new REST({ version: "10" }).setToken(token)
  rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
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
    if(message.author.bot) return false;
    if (!await convertLabelValidator(message)) {
      await message.delete()
      return;
    } else {
      await convertLabel(message);
    }
  } catch (err) {
    console.log(err)
  }
})

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`)
  fs.mkdirSync("./labels", { recursive: true })
  fs.mkdirSync("./labelsgroups", { recursive: true })
});
client.login(token); 

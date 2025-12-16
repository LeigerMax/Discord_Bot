require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const CommandHandler = require('./utils/commandHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL'] // Nécessaire pour recevoir les DMs
});

// Initialise le gestionnaire de commandes avec le préfixe '!'
const commandHandler = new CommandHandler(client, '!');

// Événement: Bot prêt
client.once('ready', () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log(`🌐 Serveurs: ${client.guilds.cache.size}`);
  console.log(`${'='.repeat(50)}\n`);

  // Charge toutes les commandes
  const commandsPath = path.join(__dirname, 'commands');
  commandHandler.loadCommands(commandsPath);
  
  // Charge les événements
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = require('fs').readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const eventHandler = require(filePath);
      if (typeof eventHandler === 'function') {
        eventHandler(client);
        console.log(`✅ Événement chargé: ${file}`);
      } else if (typeof eventHandler.init === 'function') {
        eventHandler.init(client);
        console.log(`✅ Événement chargé: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de l'événement ${file}:`, error);
    }
  }
  
  console.log('✨ Bot prêt à recevoir des commandes!\n');
});

// Événement: Nouveau message
client.on('messageCreate', async (message) => {
  await commandHandler.handleMessage(message);
});

// Gestion des erreurs
client.on('error', error => {
  console.error('❌ Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Promesse non gérée:', error);
});

// Connexion au bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Erreur de connexion:', error);
  process.exit(1);
});



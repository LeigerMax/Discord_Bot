/**
 * Bot Discord principal
 * Initialise le client, charge les commandes et gère les événements
 **/

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const ffmpegPath = require('ffmpeg-static');
const path = require('node:path');
const CommandHandler = require('./utils/commandHandler');
const keepAlive = require('./services/keepAlive');
const play = require('play-dl');

// ============================================
// Configuration
// ============================================

// Configure FFmpeg pour le traitement audio
process.env.FFMPEG_PATH = ffmpegPath;

// Configure play-dl pour éviter les erreurs d'authentification
play.getFreeClientID().then(clientID => play.setToken({
  soundcloud: {
    client_id: clientID
  }
})).catch(() => {
  console.log('⚠️ Impossible de configurer le client SoundCloud, mais YouTube devrait fonctionner');
});

// ============================================
// Initialisation du client Discord
// ============================================

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
  partials: ['CHANNEL'] 
});

// ============================================
// Initialisation du système de musique
// ============================================

// Crée le player musical (ne pas assigner à client.player, utiliser useMainPlayer())
const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    filter: 'audioonly'
  }
});

// Variable pour suivre le chargement des extracteurs
let extractorsLoaded = false;

// Fonction pour charger les extracteurs
async function loadExtractors() {
  try {
    // Charge d'abord l'extracteur YouTube (le plus important)
    const { YoutubeExtractor } = require('discord-player-youtube');
    await player.extractors.register(YoutubeExtractor, {
      authentication: process.env.YOUTUBE_COOKIE || undefined,
      streamOptions: {
        useClient: 'ANDROID',  // Utilise le client Android pour éviter les restrictions
        highWaterMark: 1 << 25
      }
    });
    console.log('✅ Extracteur YouTube chargé (mode ANDROID)!');
    
    // Puis charge les autres extracteurs (SoundCloud, Spotify, etc.)
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('✅ Autres extracteurs chargés!');
    
    extractorsLoaded = true;
    console.log('📋 Total extracteurs disponibles:', player.extractors.store.size);
    console.log('');
  } catch (error) {
    console.error('❌ Erreur lors du chargement des extracteurs:', error);
  }
}

// Événements du player
player.events.on('playerStart', (queue, track) => {
  queue.metadata.send(`🎶 Lecture en cours: **${track.title}**`);
});

player.events.on('error', (queue, error) => {
  // N'affiche que les erreurs critiques, pas les erreurs de fallback
  console.error('❌ Erreur critique du player:', error.message);
  if (queue?.metadata) {
    queue.metadata.send('❌ Une erreur est survenue lors de la lecture!');
  }
});

player.events.on('playerError', (queue, error) => {
  // N'affiche que les erreurs critiques, pas les tentatives de fallback
  console.error('❌ Erreur de lecture:', error.message);
  if (queue?.metadata) {
    queue.metadata.send(`❌ Erreur: ${error.message}`);
  }
});

// ============================================
// Initialisation du gestionnaire de commandes
// ============================================

const commandHandler = new CommandHandler(client, '!');
client.commandHandler = commandHandler;

// ============================================
// Événement: Bot prêt
// ============================================

client.once('clientReady', async () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  console.log(`Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log(`Serveurs: ${client.guilds.cache.size}`);
  console.log(`${'='.repeat(50)}\n`);

  // Charge toutes les commandes
  const commandsPath = path.join(__dirname, 'commands');
  commandHandler.loadCommands(commandsPath);
  
  // Charge les événements
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = require('node:fs').readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  console.log('\nChargement des événements...');
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const eventHandler = require(filePath);
      if (typeof eventHandler === 'function') {
        eventHandler(client);
        console.log(`✅ Événement chargé: ${file}`);
      } else if (eventHandler.name && typeof eventHandler.execute === 'function') {
        // Format Discord.js standard
        if (eventHandler.once) {
          client.once(eventHandler.name, (...args) => eventHandler.execute(...args));
        } else {
          client.on(eventHandler.name, (...args) => eventHandler.execute(...args));
        }
        console.log(`✅ Événement chargé: ${file} (${eventHandler.name})`);
      } else if (typeof eventHandler.init === 'function') {
        eventHandler.init(client);
        console.log(`✅ Événement chargé: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de l'événement ${file}:`, error);
    }
  }
  
  console.log('\n✅ Bot prêt à recevoir des commandes!\n');
});

// ============================================
// Gestion des messages et événements
// ============================================

client.on('messageCreate', async (message) => {
  await commandHandler.handleMessage(message);
});

// ============================================
// Gestion des erreurs
// ============================================

client.on('error', error => {
  console.error('Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
  console.error('Promesse non gérée:', error);
});

// ============================================
// Connexion et démarrage
// ============================================

// Fonction principale async pour attendre le chargement des extracteurs
(async () => {
  // Attends que les extracteurs soient complètement chargés
  await loadExtractors();
  
  // Ensuite connecte le bot
  await client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Erreur de connexion:', error);
    process.exit(1);
  });
  
  keepAlive();
})();



/**
 * @file Discord Bot Main Entry Point
 * @description Initialise le client Discord, configure le système musical, charge les commandes et gère les événements
 * @module bot
 * @requires dotenv
 * @requires discord.js
 * @requires discord-player
 * @author Maxou
 * @version 0.1.4
 */

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const path = require('node:path');
const CommandHandler = require('./utils/commandHandler');
const keepAlive = require('./services/keepAlive');


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

// Fonction pour charger les extracteurs
async function loadExtractors() {
  try {
  
      const { YoutubeExtractor } = require('discord-player-youtube');
      await player.extractors.register(YoutubeExtractor, {
        streamOptions: {
          // Essaie plusieurs clients pour maximiser la compatibilité
          useClient: ['ANDROID', 'WEB', 'IOS'],
          highWaterMark: 1 << 25
        },
        authentication: process.env.YOUTUBE_COOKIE || undefined,
        
        // Utilise ytdl-core pour contourner les restrictions
        createStream: async (url) => {
          const ytdl = require('ytdl-core');
          const cookieOptions = {};
          
          // Ajoute les cookies si disponibles
          if (process.env.YOUTUBE_COOKIE) {
            cookieOptions.requestOptions = {
              headers: {
                cookie: process.env.YOUTUBE_COOKIE,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            };
          } else {
            cookieOptions.requestOptions = {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            };
          }
          
          return ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
            ...cookieOptions
          });
        }
      });
     
    
    // Charge les autres extracteurs (SoundCloud, Spotify, etc.)
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors);
    
    console.log('✅ Extracteurs chargés avec succès');
    
    // Affiche le statut de configuration des cookies
    if (process.env.YOUTUBE_COOKIE) {
      console.log('Cookies YouTube configurés ✓');
    } else {
      console.log('Cookies YouTube non configurés');
    }
  } catch (error) {
     console.error('❌ Erreur lors du chargement de l\'extracteur YouTube:', error);
  }
}

// Événements du player
player.events.on('playerStart', (queue, track) => {
  console.log('🎵 [Lecture démarrée]');
  console.log(`   Titre: ${track.title}`);
  console.log(`   Source: ${track.source}`);
  console.log(`   URL: ${track.url}`);
  if (track.raw?.source) {
    console.log(`   Extracteur utilisé: ${track.raw.source}`);
  }
  console.log('');
  queue.metadata.send(`🎶 Lecture en cours: **${track.title}**`);
});

player.events.on('error', (queue, error) => {
  // N'affiche que les erreurs critiques, pas les erreurs de fallback
  console.error('❌ [Erreur critique du player]:', error.message);
  if (queue?.metadata) {
    queue.metadata.send('❌ Une erreur est survenue lors de la lecture!');
  }
});

player.events.on('playerError', (queue, error) => {
  // Filtre les erreurs de streaming pour ne pas spammer
  const errorMsg = error.message || error.toString();
  
  // Ignore les erreurs de tentatives de fallback (messages informatifs)
  if (errorMsg.includes('Stream error') || errorMsg.includes('Extractor')) {
    console.log('🔄 [Fallback automatique] Discord-player essaie un autre extracteur...');
    console.log('   ℹ️  Ceci est normal et ne bloque pas la lecture');
    return;
  }
  
  console.error('❌ [Erreur de lecture]:', errorMsg);
  if (queue?.metadata) {
    // Messages d'erreur plus clairs pour l'utilisateur
    if (errorMsg.includes('Sign in') || errorMsg.includes('signed in')) {
      const cookieConfigured = process.env.YOUTUBE_COOKIE ? '✓' : '✗';
      queue.metadata.send(
        `❌ Cette vidéo nécessite une authentification YouTube.\n` +
        `📋 Cookies configurés: ${cookieConfigured}\n` +
        `${!process.env.YOUTUBE_COOKIE ? '💡 Ajoutez la variable YOUTUBE_COOKIE sur Render (voir YOUTUBE_COOKIES_GUIDE.md)' : '⚠️ Les cookies ont peut-être expiré, essayez de les renouveler.'}`
      );
    } else if (errorMsg.includes('extract stream')) {
      queue.metadata.send('❌ Impossible de lire cette musique. Elle est peut-être restreinte ou indisponible.');
    } else {
      queue.metadata.send(`❌ Erreur de lecture: ${errorMsg}`);
    }
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
  
  // Configure la présence du bot
  const botConfig = require('./config/botConfig.json');
  const { ActivityType } = require('discord.js');
  
  try {
    const { status, activities } = botConfig.presence;
    const activityTypeMap = {
      'PLAYING': ActivityType.Playing,
      'WATCHING': ActivityType.Watching,
      'LISTENING': ActivityType.Listening,
      'STREAMING': ActivityType.Streaming,
      'COMPETING': ActivityType.Competing
    };
    
    client.user.setPresence({
      status: status || 'online',
      activities: activities.map(activity => ({
        name: activity.name,
        type: activityTypeMap[activity.type] || ActivityType.Playing
      }))
    });
    console.log(`✅ Présence du bot définie: ${status} - ${activities[0]?.name}`);
  } catch (error) {
    console.error('❌ Erreur lors de la définition de la présence:', error);
  }

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



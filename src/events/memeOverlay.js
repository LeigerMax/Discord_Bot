/**
 * @file Meme Overlay Event
 * @description Détecte les images (mèmes) postées dans un salon Discord configuré et les diffuse via Socket.io
 * @module events/memeOverlay
 * @listens messageCreate
 */

const { io } = require('socket.io-client');
const botConfig = require('../config/botConfig.json');
const storageService = require('../services/storageService');

module.exports = (client) => {
  const config = botConfig.memeOverlay;

  // Si l'URL du serveur est manquante, on ne fait rien
  if (!config || !config.serverUrl) {
    console.error('❌ [MemeOverlay] L\'URL du serveur WebSocket (serverUrl) n\'est pas configurée.');
    return;
  }

  console.log(`🔌 [MemeOverlay] Connexion au serveur WebSocket: ${config.serverUrl}`);

  // Initialisation du client Socket.io avec reconnexion automatique
  const socket = io(config.serverUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  // Événements de connexion Socket.io
  socket.on('connect', () => {
    console.log('✅ [MemeOverlay] Connecté avec succès au serveur WebSocket.');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ [MemeOverlay] Erreur de connexion au serveur WebSocket:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`⚠️ [MemeOverlay] Déconnecté du serveur WebSocket. Raison: ${reason}`);
  });

  // Écouteur d'événement Discord messageCreate
  client.on('messageCreate', async (message) => {
    try {
      // 1. Ignore les messages des bots
      if (message.author.bot) return;

      // 2. Récupère la configuration spécifique au serveur (guild)
      let isEnabled = false;
      let targetChannelId = null;

      if (message.guild) {
        const guildConfig = storageService.get(message.guild.id);
        if (guildConfig && guildConfig.memeOverlay) {
          isEnabled = guildConfig.memeOverlay.enabled;
          targetChannelId = guildConfig.memeOverlay.channelId;
        }
      }

      // Si pas de config sur le serveur, on utilise la config globale en fallback
      if (targetChannelId === null) {
        isEnabled = config ? config.enabled : false;
        targetChannelId = config ? config.channelId : null;
      }

      // 3. Vérifie si la fonctionnalité est activée
      if (!isEnabled) return;

      // 4. Vérifie si le message provient bien du salon configuré
      if (message.channel.id !== targetChannelId) return;

      // 4. Vérifie s'il y a des pièces jointes dans le message
      if (message.attachments.size === 0) return;

      // 5. Recherche une pièce jointe qui est une image
      const attachment = message.attachments.find(att => {
        const isImgType = att.contentType?.startsWith('image/');
        const isImgExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.name || att.url || '');
        return isImgType || isImgExt;
      });

      if (!attachment) return;

      // URL de l'image du mème et le texte saisi par l'utilisateur
      const imageUrl = attachment.url;
      const textContent = message.content || '';

      console.log(`📸 [MemeOverlay] Mème détecté dans le salon ${message.channel.name || message.channel.id} par ${message.author.tag}`);
      console.log(`🔗 URL: ${imageUrl}`);
      if (textContent) {
        console.log(`💬 Texte: "${textContent}"`);
      }

      // 6. Émet l'événement au serveur WebSocket
      socket.emit('diffuser_meme', {
        url: imageUrl,
        text: textContent,
        author: message.author.tag,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ [MemeOverlay] Une erreur est survenue lors du traitement du message:', error);
    }
  });

  // Expose le socket sur l'objet client pour pouvoir le fermer ou l'utiliser ailleurs (comme dans les tests)
  client.memeOverlaySocket = socket;
};

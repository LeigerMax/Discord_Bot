/**
 * @file Meme Overlay Event
 * @description Détecte les images (mèmes) postées dans un salon Discord configuré et les diffuse via Socket.io
 * @module events/memeOverlay
 * @listens messageCreate
 */

const { io } = require('socket.io-client');
const botConfig = require('../config/botConfig.json');
const storageService = require('../services/storageService');

// Cache de connexions clients Socket.io pour les URL de serveurs externes
const activeConnections = new Map();

/**
 * Détermine si une URL est un placeholder ou vide
 * @param {string} url - L'URL à tester
 * @returns {boolean}
 */
function isPlaceholder(url) {
  return !url || 
         url === 'https://ton-serveur-gratuit.onrender.com' || 
         url === 'METS_ICI_L_ID_DU_SALON_DISCORD' ||
         url.trim() === '';
}

module.exports = (client) => {
  const config = botConfig.memeOverlay;

  /**
   * Récupère ou crée une connexion WebSocket client pour une URL donnée
   * @param {string} serverUrl 
   * @returns {Object|null}
   */
  function getOrCreateSocket(serverUrl) {
    if (isPlaceholder(serverUrl)) return null;

    if (activeConnections.has(serverUrl)) {
      return activeConnections.get(serverUrl);
    }

    console.log(`🔌 [MemeOverlay] Initialisation de la connexion vers le serveur WebSocket: ${serverUrl}`);

    const socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3, // Limite les tentatives pour éviter le spam de logs en cas d'erreur
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log(`✅ [MemeOverlay] Connecté avec succès au serveur WebSocket externe: ${serverUrl}`);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ [MemeOverlay] Erreur de connexion au serveur WebSocket externe ${serverUrl}:`, error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚠️ [MemeOverlay] Déconnecté du serveur WebSocket externe ${serverUrl}. Raison: ${reason}`);
    });

    activeConnections.set(serverUrl, socket);
    return socket;
  }

  // Initialisation du socket global s'il est configuré et valide
  if (config && config.serverUrl && !isPlaceholder(config.serverUrl)) {
    const globalSocket = getOrCreateSocket(config.serverUrl);
    if (globalSocket) {
      client.memeOverlaySocket = globalSocket;
    }
  } else {
    console.log('ℹ️ [MemeOverlay] Aucun serveur WebSocket global configuré ou placeholder détecté. Utilisation du serveur WebSocket intégré ou des configurations par serveur.');
  }

  // Écouteur d'événement Discord messageCreate
  client.on('messageCreate', async (message) => {
    try {
      // 1. Ignore les messages des bots
      if (message.author.bot) return;

      // 2. Récupère la configuration spécifique au serveur (guild)
      let isEnabled = false;
      let targetChannelId = null;
      let serverUrl = '';

      if (message.guild) {
        const guildConfig = storageService.get(message.guild.id);
        if (guildConfig && guildConfig.memeOverlay) {
          isEnabled = guildConfig.memeOverlay.enabled;
          targetChannelId = guildConfig.memeOverlay.channelId;
          serverUrl = guildConfig.memeOverlay.serverUrl || '';
        }
      }

      // Si pas de config sur le serveur, on utilise la config globale en fallback
      if (targetChannelId === null) {
        isEnabled = config ? config.enabled : false;
        targetChannelId = config ? config.channelId : null;
        serverUrl = config ? config.serverUrl : '';
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

      const payload = {
        url: imageUrl,
        text: textContent,
        author: message.author.tag,
        timestamp: new Date().toISOString()
      };

      // 6. Émet l'événement localement via le serveur WebSocket intégré s'il existe
      if (client.io) {
        console.log('📢 [MemeOverlay] Diffusion locale du mème via le serveur WebSocket intégré.');
        client.io.emit('diffuser_meme', payload);
      }

      // 7. Émet l'événement au serveur WebSocket configuré (externe) si non-placeholder
      if (serverUrl && !isPlaceholder(serverUrl)) {
        const socket = getOrCreateSocket(serverUrl);
        if (socket) {
          console.log(`📢 [MemeOverlay] Diffusion externe du mème vers: ${serverUrl}`);
          socket.emit('diffuser_meme', payload);
        }
      } else {
        // En fallback, si on a un socket global (comme configuré dans les tests unitaires)
        if (client.memeOverlaySocket && typeof client.memeOverlaySocket.emit === 'function') {
          client.memeOverlaySocket.emit('diffuser_meme', payload);
        }
      }

    } catch (error) {
      console.error('❌ [MemeOverlay] Une erreur est survenue lors du traitement du message:', error);
    }
  });
};

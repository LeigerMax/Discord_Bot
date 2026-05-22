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

/**
 * Extrait l'URL de l'image ou du GIF d'un message Discord (depuis les pièces jointes ou les embeds)
 * @param {Object} msg - Le message Discord.js
 * @returns {string|null}
 */
function getImageUrl(msg) {
  // 1. Recherche dans les pièces jointes
  if (msg.attachments && msg.attachments.size > 0) {
    const attachment = msg.attachments.find(att => {
      const isImgType = att.contentType?.startsWith('image/');
      const isImgExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.name || att.url || '');
      return isImgType || isImgExt;
    });
    if (attachment) return attachment.url;
  }

  // 2. Recherche dans les embeds (ex: GIFs Tenor/Giphy intégrés)
  if (msg.embeds && msg.embeds.length > 0) {
    const embed = msg.embeds.find(e => {
      const imgUrl = e.image?.url || e.thumbnail?.url;
      return !!imgUrl;
    });
    if (embed) return embed.image?.url || embed.thumbnail?.url;
  }

  // 3. Fallback: Parse du contenu textuel pour les liens directs ou Giphy
  const content = msg.content || '';
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = content.match(urlRegex);
  if (urls) {
    for (const url of urls) {
      // Lien direct vers une image ou un GIF
      if (/\.(jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?$/i.test(url)) {
        return url;
      }
      // Lien Giphy direct
      const giphyMatch = url.match(/giphy\.com\/gifs\/.*-([a-zA-Z0-9]+)/i);
      if (giphyMatch && giphyMatch[1]) {
        return `https://media.giphy.com/media/${giphyMatch[1]}/giphy.gif`;
      }
    }
  }

  return null;
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

      // 5. Recherche une image ou un GIF (pièce jointe ou embed)
      let imageUrl = getImageUrl(message);

      // Si aucune image trouvée directement mais que le message contient un lien potentiel,
      // on attend 1 seconde pour laisser à Discord le temps de générer les embeds (unfurling)
      if (!imageUrl && message.content && /(tenor\.com|giphy\.com|https?:\/\/)/i.test(message.content)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const fetchedMessage = await message.channel.messages.fetch(message.id);
          imageUrl = getImageUrl(fetchedMessage);
        } catch (e) {
          console.warn('⚠️ [MemeOverlay] Impossible de récupérer le message mis à jour pour les embeds:', e.message);
        }
      }

      if (!imageUrl) return;

      // URL de l'image du mème et le texte saisi par l'utilisateur
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

/**
 * @file Auto Command
 * @description Envoie un message automatiquement à intervalle régulier dans un salon
 * @module commands/admin/auto
 * @category Admin
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');

// Stockage des intervalles actifs
const activeIntervals = new Map();

// Garbage collector: nettoie les intervalles inactifs toutes les 10 minutes
setInterval(() => {
  for (const [key, intervalData] of activeIntervals) {
    if (intervalData.lastActivity && Date.now() - intervalData.lastActivity > 24 * 60 * 60 * 1000) {
      clearInterval(intervalData.interval);
      activeIntervals.delete(key);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  name: 'auto',
  description: 'Envoie un message automatiquement tous les X secondes',
  usage: '!auto <temps_en_secondes> <message> OU !auto stop',
  
  async execute(message, args) {
    try {
      // Vérifie les permissions
      if (!message.member.permissions.has('Administrator')) {
        return message.reply('❌ Tu dois être administrateur pour utiliser cette commande!');
      }

      // Commande pour arrêter l'auto-message
      if (args[0] === 'stop') {
        const channelId = message.channel.id;
        
        if (activeIntervals.has(channelId)) {
          clearInterval(activeIntervals.get(channelId));
          activeIntervals.delete(channelId);
          
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription('⏹️ Message automatique arrêté!');
          
          return message.reply({ embeds: [embed] });
        } else {
          return message.reply('❌ Aucun message automatique actif dans ce salon!');
        }
      }

      // Vérifie les arguments
      if (args.length < 2) {
        return message.reply({
          content: '❌ **Erreur**: Utilisation incorrecte!\n' +
                   '**Exemple**: `!auto 60 Ceci est un rappel automatique`\n' +
                   '**Arrêter**: `!auto stop`'
        });
      }

      const interval = parseInt(args[0]);
      const autoMessage = args.slice(1).join(' ');

      // Validation du temps
      if (Number.isNaN(interval) || interval < 10) {
        return message.reply('❌ Le temps doit être un nombre supérieur ou égal à 10 secondes!');
      }

      if (interval > 3600) {
        return message.reply('❌ Le temps maximum est de 3600 secondes (1 heure)!');
      }

      // Validation du message
      if (autoMessage.length < 1) {
        return message.reply('❌ Le message ne peut pas être vide!');
      }

      if (autoMessage.length > 500) {
        return message.reply('❌ Le message est trop long (max 500 caractères)!');
      }

      const channelId = message.channel.id;

      // Arrête l'ancien intervalle s'il existe
      if (activeIntervals.has(channelId)) {
        clearInterval(activeIntervals.get(channelId));
      }

      // Crée le nouvel intervalle
      const intervalId = setInterval(() => {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setDescription(`🔔 ${autoMessage}`)
          .setFooter({ text: `Message automatique • Tous les ${interval}s` })
          .setTimestamp();

        message.channel.send({ embeds: [embed] }).catch(err => {
          console.error('Erreur lors de l\'envoi du message automatique:', err);
          clearInterval(intervalId);
          activeIntervals.delete(channelId);
        });
      }, interval * 1000);

      activeIntervals.set(channelId, intervalId);

      // Confirmation
      const confirmEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Message automatique activé!')
        .setDescription(`**Message**: ${autoMessage}\n**Intervalle**: Tous les ${interval} secondes`)
        .setFooter({ text: 'Utilisez !auto stop pour arrêter' });

      await message.reply({ embeds: [confirmEmbed] });

    } catch (error) {
      console.error('Erreur dans la commande auto:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

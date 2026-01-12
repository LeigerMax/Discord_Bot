/**
 * @file DM Reply Event
 * @description Module pour gérer les réponses aux messages privés. Permet de transférer les réponses des utilisateurs vers l'expéditeur original
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

// Map pour stocker les relations: destinataire -> expéditeur original
// Format: Map<userId du destinataire, userId de l'expéditeur>
const dmTracking = new Map();

// Fonction pour ajouter un tracking
function trackDM(recipientId, senderId) {
  dmTracking.set(recipientId, senderId);
  
  // Supprime le tracking après 24 heures
  setTimeout(() => {
    dmTracking.delete(recipientId);
  }, 24 * 60 * 60 * 1000);
}

// Fonction pour obtenir l'expéditeur original
function getOriginalSender(recipientId) {
  return dmTracking.get(recipientId);
}

module.exports = {
  trackDM,
  getOriginalSender,
  
  init: (client) => {
    client.on('messageCreate', async (message) => {
      try {
        // Ignore les messages du bot lui-même
        if (message.author.bot) return;
        
        // Vérifie si c'est un DM
        if (message.channel.type !== 1) return; // 1 = DM
        
        // Vérifie si l'auteur du message est dans le tracking
        const originalSenderId = getOriginalSender(message.author.id);
        
        if (!originalSenderId) return; // Pas de tracking pour cet utilisateur
        
        // Récupère l'expéditeur original
        const originalSender = await client.users.fetch(originalSenderId).catch(() => null);
        
        if (!originalSender) return;
        
        const replyEmbed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('💬 Réponse à ton message secret')
          .setDescription(`**${message.author.username}** a répondu:\n\n${message.content}`)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `De: ${message.author.tag}` })
          .setTimestamp();
        
        // Ajoute les pièces jointes s'il y en a
        if (message.attachments.size > 0) {
          const attachments = Array.from(message.attachments.values()).map(att => att.url).join('\n');
          replyEmbed.addFields({ name: '📎 Pièces jointes', value: attachments });
        }
        
        // Envoie au destinataire original
        await originalSender.send({ embeds: [replyEmbed] });
        
        // Confirme la réception
        const confirmEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setDescription('✅ Ton message a été transféré!')
          .setFooter({ text: 'Système de réponse automatique' });
        
        await message.reply({ embeds: [confirmEmbed] });
        
      } catch (error) {
        // L'erreur est gérée silencieusement - pas besoin de log en production
      }
    });
  }
};

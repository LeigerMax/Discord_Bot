/**
 * Commande pour afficher les messages supprimés
 * @param {Message} message - Le message Discord
 * @param {Array} args - Les arguments de la commande
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'showdeleted',
  description: 'Affiche les derniers messages supprimés',
  usage: '!showdeleted [nombre] [@utilisateur]',
  
  async execute(message, args) {
    try {
      // Vérifie les permissions
      if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('❌ Tu n\'as pas la permission de voir les messages supprimés!');
      }

      // Récupère l'event messageDelete pour accéder aux données
      const messageDeleteEvent = message.client.eventHandlers?.get('messageDelete');
      
      if (!messageDeleteEvent || !messageDeleteEvent.getDeletedMessages) {
        return message.reply('❌ Le système de tracking des messages supprimés n\'est pas disponible!');
      }

      // Parse les arguments
      let limit = 10;
      let targetUser = null;

      for (const arg of args) {
        const num = parseInt(arg);
        if (!isNaN(num) && num > 0) {
          limit = Math.min(num, 25); // Max 25
        }
      }

      targetUser = message.mentions.users.size > 0 ? message.mentions.users.values().next().value : null;

      // Récupère les messages supprimés
      const deletedMessages = messageDeleteEvent.getDeletedMessages(limit, targetUser?.id);

      if (deletedMessages.length === 0) {
        return message.reply('✨ Aucun message supprimé récemment!');
      }

      // Crée l'embed principal
      const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('🗑️ Messages Supprimés')
        .setDescription(
          `Affichage des **${deletedMessages.length}** derniers messages supprimés` +
          (targetUser ? ` de ${targetUser.username}` : '')
        )
        .setTimestamp();

      // Ajoute chaque message
      for (let i = 0; i < Math.min(deletedMessages.length, 10); i++) {
        const msg = deletedMessages[i];
        
        const timeDiff = Math.floor((Date.now() - msg.deletedAt.getTime()) / 1000);
        let timeStr;
        if (timeDiff < 60) {
          timeStr = `${timeDiff}s`;
        } else if (timeDiff < 3600) {
          timeStr = `${Math.floor(timeDiff / 60)}m`;
        } else {
          timeStr = `${Math.floor(timeDiff / 3600)}h`;
        }

        let content = msg.content;
        if (content.length > 200) {
          content = content.substring(0, 200) + '...';
        }

        let fieldValue = `**Auteur**: ${msg.author.username}\n`;
        fieldValue += `**Canal**: ${msg.channel.name}\n`;
        fieldValue += `**Il y a**: ${timeStr}\n`;
        fieldValue += `**Contenu**: ${content || '[Aucun texte]'}`;

        if (msg.attachments.length > 0) {
          fieldValue += `\n📎 **${msg.attachments.length}** pièce(s) jointe(s)`;
        }

        embed.addFields({
          name: `Message ${i + 1}`,
          value: fieldValue,
          inline: false
        });
      }

      if (deletedMessages.length > 10) {
        embed.setFooter({ text: `${deletedMessages.length - 10} message(s) supplémentaire(s) non affichés` });
      }

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande showdeleted:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération des messages supprimés.');
    }
  }
};

/**
 * @file Brain Command
 * @description Vérifie si le cerveau d'un utilisateur est allumé, éteint, en lag, etc.
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'brain',
  description: 'Vérifie si ton cerveau est allumé',
  usage: '!brain [@utilisateur]',
  
  async execute(message, args) {
    try {
      // Vérifie si un utilisateur est mentionné, sinon utilise l'auteur
      const targetUser = message.mentions.users.first() || message.author;
      
      // États possibles du cerveau
      const states = [
        { emoji: '🧠✅', status: 'Brain: ON', description: 'Plays smart, pense avant d\'agir', color: 0x00FF00 },
        { emoji: '🧠❌', status: 'Brain: OFF', description: 'Push solo, no brain comme Miguel', color: 0xFF0000 },
        { emoji: '🧠⚡', status: 'Brain: LAG', description: 'Aucune info ne passe', color: 0xFFFF00 },
        { emoji: '🧠💤', status: 'Brain: AFK', description: 'Mode auto-pilote activé', color: 0x808080 },
        { emoji: '🧠🔥', status: 'Brain: OVERLOAD', description: '200 IQ plays incoming', color: 0xFF6600 },
        { emoji: '🧠🐌', status: 'Brain: SLOW', description: 'Prend son temps pour comprendre', color: 0x996633 },
        { emoji: '🧠🎲', status: 'Brain: RANDOM', description: 'Décisions imprévisibles', color: 0x9966FF },
        { emoji: '🧠☕', status: 'Brain: NEED COFFEE', description: 'Pas réveillé, fonctionne à 10%', color: 0x8B4513 }
      ];

      // Sélectionne un état aléatoire
      const selectedState = states[Math.floor(Math.random() * states.length)];

      const embed = new EmbedBuilder()
        .setColor(selectedState.color)
        .setTitle('🧠 État du Cerveau')
        .setDescription(
          `**Joueur**: ${targetUser.username}\n\n` +
          `${selectedState.emoji} **${selectedState.status}**\n` +
          `*${selectedState.description}*`
        )
        .setFooter({ text: 'Scan neuronal effectué' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande brain:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

/**
 * @file Monitor Command
 * @description Vérifie l'état de ton écran
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'monitor',
  description: 'Vérifie l\'état de ton écran',
  usage: '!monitor [@utilisateur]',
  
  async execute(message, args) {
    try {
      // Vérifie si un utilisateur est mentionné, sinon utilise l'auteur
      const targetUser = message.mentions.users.first() || message.author;
      
      // États possibles de l'écran
      const states = [
        { emoji: '🖥️', status: 'Écran nickel', description: 'Comme neuf, aucune trace', color: 0x00FF00, chance: 35 },
        { emoji: '🖥️', status: 'Trace de doigt', description: 'Quelqu\'un a pointé l\'écran', color: 0x99FF99, chance: 20 },
        { emoji: '🪟', status: 'Fissure légère', description: 'Coin supérieur droit touché', color: 0xFFFF00, chance: 20 },
        { emoji: '💥', status: 'Écran fissuré', description: 'Impact au centre, toile d\'araignée', color: 0xFF9900, chance: 15 },
        { emoji: '🔨', status: 'Écran explosé', description: 'Rage quit avec objet contondant', color: 0xFF0000, chance: 8 },
        { emoji: '☠️', status: 'Écran KO', description: 'Coup de poing critique détecté', color: 0x8B0000, chance: 2 }
      ];

      // Sélection pondérée
      const totalChance = states.reduce((sum, state) => sum + state.chance, 0);
      let random = Math.random() * totalChance;
      let selectedState;

      for (const state of states) {
        random -= state.chance;
        if (random <= 0) {
          selectedState = state;
          break;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(selectedState.color)
        .setTitle('🖥️ État de l\'Écran')
        .setDescription(
          `**Joueur**: ${targetUser.username}\n\n` +
          `${selectedState.emoji} **${selectedState.status}**\n` +
          `*${selectedState.description}*`
        )
        .setFooter({ text: 'Inspection visuelle terminée' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande monitor:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

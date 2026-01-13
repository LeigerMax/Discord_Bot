/**
 * @file Coin Command
 * @description Lance une pièce de monnaie aléatoire - Pile ou Face
 * @module commands/fun/coin
 * @category Fun
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coin',
  description: 'Lance une pièce - Pile ou Face',
  usage: '!coin',
  
  async execute(message, _args) {
    try {
      // Résultats possibles
      const results = ['Pile', 'Face'];
      const result = results[Math.floor(Math.random() * results.length)];
      
      const emoji = result === 'Pile' ? '🪙' : '💰';

      const embed = new EmbedBuilder()
        .setColor(result === 'Pile' ? 0xFFD700 : 0xC0C0C0)
        .setTitle('🎲 Lancer de Pièce')
        .setDescription(`${emoji} **Résultat**: **${result}**!`)
        .setFooter({ text: `Lancé par ${message.author.username}` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande coin:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

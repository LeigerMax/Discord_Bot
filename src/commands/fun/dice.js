/**
 * @file Dice Command
 * @description Lance un dé à 6 faces
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dice',
  description: 'Lance un dé à 6 faces',
  usage: '!dice',
  
  async execute(message, args) {
    try {
      // Génère un nombre aléatoire entre 1 et 6
      const result = Math.floor(Math.random() * 6) + 1;
      
      // Emojis de dés
      const diceEmojis = {
        1: '⚀',
        2: '⚁',
        3: '⚂',
        4: '⚃',
        5: '⚄',
        6: '⚅'
      };

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎲 Lancer de Dé')
        .setDescription(`${diceEmojis[result]} **Tu as obtenu**: **${result}**`)
        .setFooter({ text: `Lancé par ${message.author.username}` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande dice:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

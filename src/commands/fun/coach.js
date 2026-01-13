/**
 * @file Coach Command
 * @description Fournit un conseil de coach gaming aléatoire, sérieux ou troll
 * @module commands/fun/coach
 * @category Fun
 * @requires discord.js
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coach',
  description: 'Reçois un conseil de coach gaming',
  usage: '!coach',
  
  async execute(message, _args) {
    try {
      // Liste de conseils variés (sérieux et troll)
      const advices = [
        { text: 'Regarde la minimap toutes les 3 secondes', type: 'Sérieux', emoji: '🗺️' },
        { text: 'Arrête de reload après chaque kill', type: 'Sérieux', emoji: '🔫' },
        { text: 'Joue safe quand t\'es carry', type: 'Sérieux', emoji: '🛡️' },
        { text: 'Communique avec ton équipe', type: 'Sérieux', emoji: '🎙️' },
        { text: 'Prends des pauses toutes les heures', type: 'Sérieux', emoji: '☕' },
        { text: 'Ajuste ta sensibilité souris', type: 'Sérieux', emoji: '🖱️' },
        { text: 'Vise la tête, pas les pieds', type: 'Sérieux', emoji: '🎯' },
        { text: 'Utilise tes capacités au bon moment', type: 'Sérieux', emoji: '⚡' },
        { text: 'Farm avant de fight', type: 'Sérieux', emoji: '⚔️' },
        { text: 'Check tes angles morts', type: 'Sérieux', emoji: '👁️' },
        { text: 'Blame le support', type: 'Troll', emoji: '😈' },
        { text: 'Spam ping ton toplaner', type: 'Troll', emoji: '📍' },
        { text: 'Push solo sans vision', type: 'Troll', emoji: '💀' },
        { text: 'Achète que des skins, ça buff', type: 'Troll', emoji: '💰' },
        { text: 'Flash sur place pour assert dominance', type: 'Troll', emoji: '✨' },
        { text: 'Trashtalk en all chat pour tilt l\'ennemi', type: 'Troll', emoji: '💬' },
        { text: 'AFK si première mort', type: 'Troll', emoji: '🚪' },
        { text: 'Joue avec les pieds, c\'est plus fun', type: 'Troll', emoji: '🦶' },
        { text: 'Le problème c\'est jamais toi', type: 'Troll', emoji: '🤡' },
        { text: 'Désactive le son, joue à l\'instinct', type: 'Troll', emoji: '🔇' },
        { text: 'Monte ton DPI à 10000', type: 'Troll', emoji: '🚀' },
        { text: 'Respire profondément avant de jouer', type: 'Mental', emoji: '🧘' },
        { text: 'Hydrate-toi', type: 'Mental', emoji: '💧' },
        { text: 'Éteins ton PC, sors dehors', type: 'Réaliste', emoji: '🌳' }
      ];

      // Sélectionne un conseil aléatoire
      const advice = advices[Math.floor(Math.random() * advices.length)];

      // Couleur selon le type
      let color;
      if (advice.type === 'Sérieux') {
        color = 0x00FF00;
      } else if (advice.type === 'Troll') {
        color = 0xFF0000;
      } else if (advice.type === 'Mental') {
        color = 0x00BFFF;
      } else {
        color = 0x808080;
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🎓 Conseil du Coach')
        .setDescription(
          `${advice.emoji} **"${advice.text}"**\n\n` +
          `*Catégorie: ${advice.type}*`
        )
        .setFooter({ text: `Pour ${message.author.username} • Coach AI` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande coach:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

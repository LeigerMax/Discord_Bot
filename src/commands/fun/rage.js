/**
 * @file Rage Command
 * @description Calcule le niveau de rage actuel d'un utilisateur avec un pourcentage aléatoire
 * @module commands/fun/rage
 * @category Fun
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rage',
  description: 'Calcule ton niveau de rage actuel',
  usage: '!rage [@utilisateur]',
  
  async execute(message, _args) {
    try {
      // Vérifie si un utilisateur est mentionné, sinon utilise l'auteur
      const targetUser = message.mentions.users.first() || message.author;
      
      // Génère un niveau de rage entre 0 et 100
      const rageLevel = Math.floor(Math.random() * 101);
      
      // Détermine l'état et l'emoji selon le niveau
      let status, emoji, color;
      
      if (rageLevel <= 20) {
        emoji = '😌';
        status = 'zen comme un moine';
        color = 0x00FF00;
      } else if (rageLevel <= 40) {
        emoji = '😐';
        status = 'calme et posé';
        color = 0x99FF99;
      } else if (rageLevel <= 60) {
        emoji = '😠';
        status = 'commence à souffler';
        color = 0xFFFF00;
      } else if (rageLevel <= 80) {
        emoji = '😡';
        status = 'bouillonne de l\'intérieur';
        color = 0xFF9900;
      } else if (rageLevel <= 95) {
        emoji = '🤬';
        status = 'clavier en danger';
        color = 0xFF0000;
      } else {
        emoji = '💢';
        status = 'mode destruction activé';
        color = 0x8B0000;
      }

      // Crée une barre de progression
      const barLength = 20;
      const filledLength = Math.floor((rageLevel / 100) * barLength);
      const emptyLength = barLength - filledLength;
      const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('😤 Niveau de Rage')
        .setDescription(`${emoji} **${targetUser.username}**\n\n${bar} **${rageLevel}%**\n\n*${status}*`)
        .setFooter({ text: 'Respire un bon coup...' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande rage:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

/**
 * @file Who Command
 * @description Choisit une personne aléatoire parmi les membres connectés dans le salon vocal
 * @module commands/fun/who
 * @category Fun
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'who',
  description: 'Choisit une personne aléatoire connectée dans le salon vocal',
  usage: '!who',
  
  async execute(message, _args) {
    try {
      // Vérifie que l'utilisateur est dans un salon vocal
      if (!message.member.voice.channel) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois être dans un salon vocal pour utiliser cette commande!'
        });
      }

      const voiceChannel = message.member.voice.channel;
      
      // Récupère tous les membres du salon vocal (sauf les bots)
      const members = voiceChannel.members.filter(member => !member.user.bot);
      
      if (members.size === 0) {
        return message.reply('❌ Aucun joueur dans le salon vocal!');
      }

      if (members.size === 1) {
        return message.reply('❌ Tu es seul dans le vocal! Il faut au moins 2 joueurs.');
      }

      // Sélectionne un membre aléatoire
      const randomMember = members.random();

      // Crée un embed
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎯 Sélection Aléatoire')
        .setDescription(
          `**${members.size}** joueurs dans le vocal...\n\n` +
          `✨ **${randomMember.user.username}** a été choisi!`
        )
        .setThumbnail(randomMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: `Sélectionné parmi ${members.size} joueur(s)` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande who:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

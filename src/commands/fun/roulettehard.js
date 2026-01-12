/**
 * @file Roulette Hard Command
 * @description Sélectionne un joueur aléatoire du vocal et l'exclut 5 minutes
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roulettehard',
  description: 'Sélectionne un joueur aléatoire du vocal et l\'exclut 5 minutes',
  usage: '!roulettehard',
  
  async execute(message, args) {
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

      // Vérifie les permissions
      if (!message.guild.members.me.permissions.has('ModerateMembers')) {
        return message.reply('❌ Je n\'ai pas la permission de timeout les membres!');
      }

      if (!randomMember.moderatable) {
        return message.reply(`❌ Je ne peux pas timeout ${randomMember.user.username} (permissions insuffisantes)`);
      }

      // Crète un embed pour annoncer le résultat
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('💀 Roulette Russe HARD')
        .setDescription(`**${members.size}** joueurs dans le vocal...\n\n🔫 **${randomMember.user.username}** a été sélectionné!\n👤 **Lancé par**: ${message.author.username}\n\n⚠️ **Exclusion temporaire en cours...**`)
        .setFooter({ text: 'Mode HARD: 5 minutes de timeout' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      // Attend 2 secondes pour le suspense
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Exclut le membre pendant 5 minutes (300000 ms)
      try {
        await randomMember.timeout(300000, 'Roulette russe HARD');
        
        const successEmbed = new EmbedBuilder()
          .setColor(0x8B0000)
          .setTitle('💀 Exclusion Temporaire')
          .setDescription(
            `✅ **${randomMember.user.username}** a été exclu du serveur!\n\n` +
            `⏱️ **Durée**: 5 minutes\n` +
            `🔓 **Retour**: <t:${Math.floor((Date.now() + 300000) / 1000)}:R>`
          )
          .setFooter({ text: 'RIP • F dans le chat' })
          .setTimestamp();
        
        await message.channel.send({ embeds: [successEmbed] });
      } catch (err) {
        console.error('Erreur lors de l\'exclusion:', err);
        return message.reply('❌ Impossible d\'exclure le membre. Vérifiez les permissions du bot.');
      }

    } catch (error) {
      console.error('Erreur dans la commande roulettehard:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

/**
 * @file Voice State Update Event
 * @description Surveille les changements de salon vocal d'un utilisateur spécifique et annonce ses entrées/sorties
 * @module events/voiceStateUpdate
 * @listens voiceStateUpdate
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');
const LOOSER_ID = process.env.LOOSER_ID;
const KING_ID = process.env.KING_ID;
const ACTIVITY_SALON_ID = process.env.ACTIVITY_SALON_ID;
const looser_name = 'Miguel';


 
module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    try {

      const channel = newState.guild.channels.cache.get(ACTIVITY_SALON_ID);
      if (!channel) return;

      // Vérifie l'user
      if (newState.member.id == LOOSER_ID) {

        // Vérifie s'il vient de rejoindre un vocal 
        if (!oldState.channel && newState.channel) {
          const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`👑 ${looser_name} a rejoint le vocal!`)
            .setDescription(
              `🔊 **${newState.member.user.username}** vient de rejoindre **${newState.channel.name}**!\n\n` +
              `✨ *Le nul est arrivé!*`
            )
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExY284NmNxZXBhd3c2Y3I5MDVtdnU0aXk1MzNvenNuNnQ4eHFtc3liZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vp851KKczV9Li/giphy.gif')
            .setFooter({ text: 'Riez de sa nullité' })
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        }

        // Vérifie s'il vient de quitter un vocal
        if (oldState.channel && !newState.channel) {
          const embed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle(`👋 ${looser_name} a quitté le vocal`)
            .setDescription(`🔇 **${looser_name}** a quitté le vocal\n\n*Le nul s'en va...*`)
            .setImage('https://media.tenor.com/NDJLISUesWcAAAAM/scream-loud-scream.gif')
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        }

      }
      else if (newState.member.id == KING_ID) {
        // Vérifie s'il vient de rejoindre un vocal 
        if (!oldState.channel && newState.channel) {
          const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`👑 Le Roi est arrivé!`)
            .setDescription(
              `🔊 **${newState.member.user.username}** vient de rejoindre **${newState.channel.name}**!\n\n` +
              `✨ *Le Roi nous honore de sa présence!*`)
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXJrNmdrZHd1aW45bnB6MmtxZzNicmZveWg0ZGFyNnFuNWxrMTZ1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F0uvYzyr2a7Li/giphy.gif')
            .setFooter({ text: 'All hail the King! 👑' })
            .setTimestamp();  

            await channel.send({ embeds: [embed] });
        }

        // Vérifie s'il vient de quitter un vocal
        if (oldState.channel && !newState.channel) {
          const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle('👋 Le Roi s\'est déconnecté')
            .setDescription(
              `🚪 **${newState.member.user.username}** vient de quitter le vocal\n\n` +
              `*Le Roi nous a quittés...*`)
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGJvb2FtejY1dHo4YjcwcGlmbWU4emExZWZoZ2w3cHF4ZGtzN205cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/D80G19w5FoPuesfoMT/giphy.gif')
            .setFooter({ text: 'Absence du Roi' })
            .setTimestamp();

          await channel.send({ embeds: [embed] });
        }
      }

      } catch (error) {
        console.error('Erreur dans voiceStateUpdate:', error);
      }
    });
  
};

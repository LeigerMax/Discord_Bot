const { EmbedBuilder } = require('discord.js');

const MIGUEL_ID = '244865484065996800';

module.exports = (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
      // Vérifie si c'est Miguel
      if (newState.member.id !== MIGUEL_ID) return;

      // Vérifie s'il vient de rejoindre un vocal (n'était pas avant, est maintenant)
      if (!oldState.channel && newState.channel) {
        const channel = newState.guild.channels.cache.get('1026560355977142353');

        if (!channel) return;

        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('👑 Miguel a rejoint le vocal!')
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
        const channel = newState.guild.channels.cache.get('1026560355977142353');

        if (!channel) return;

        const embed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('👋 Miguel a quitté le vocal')
          .setDescription(`🔇 **Miguel** a quitté le vocal\n\n*Le nul s'en va...*`)
          .setImage('https://media.tenor.com/NDJLISUesWcAAAAM/scream-loud-scream.gif')
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur dans voiceStateUpdate (Miguel):', error);
    }
  });
};

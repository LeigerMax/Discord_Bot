const { EmbedBuilder } = require('discord.js');

const MIGUEL_ID = '244865484065996800';

module.exports = (client) => {
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    try {
      // Vérifie si c'est Miguel
      if (newPresence.userId !== MIGUEL_ID) return;

      const oldStatus = oldPresence?.status || 'offline';
      const newStatus = newPresence.status;

      const guild = newPresence.guild;
      const member = await guild.members.fetch(MIGUEL_ID).catch(() => null);
      
      if (!member) return;

      const channel = guild.channels.cache.get('1026560355977142353');
      if (!channel) return;

      // Vérifie s'il vient de se connecter (était offline, maintenant online/idle/dnd)
      if (oldStatus === 'offline' && (newStatus === 'online' || newStatus === 'idle' || newStatus === 'dnd')) {
        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('👑 Le Nul est en ligne!')
          .setDescription(
            `✨ **Miguel** vient de se connecter sur Discord!\n\n` +
            `*Le nul nous fait l'honneur de sa présence*`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://c.tenor.com/iu4JYPYUSmoAAAAd/tenor.gif')
          .setFooter({ text: 'All hail the noob! 👑' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

      // Vérifie s'il vient de se déconnecter (n'était pas offline, maintenant offline)
      if (oldStatus !== 'offline' && newStatus === 'offline') {
        const embed = new EmbedBuilder()
          .setColor(0x000000)
          .setTitle('👋 Miguel s\'est déconnecté')
          .setDescription(
            `🚪 **Miguel** vient de se déconnecter de Discord\n\n` +
            `*Le nul a fui...*`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://media.tenor.com/pjxZ7r5UUWsAAAAM/abell46s-reface.gif')
          .setFooter({ text: 'Absence du nul' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

      // Vérifie s'il vient de passer en "Ne pas déranger"
      if (oldStatus !== 'dnd' && newStatus === 'dnd') {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('🚫 Miguel ne veut pas être dérangé')
          .setDescription(
            `😡 **Miguel** s'est mis en "Ne pas déranger"\n\n` +
            `*Le nul est en colère...*`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyY3JlaHB1OXNnMmRyd2x5OXZnNTZwMWFvOW9kOGFxOHdpZXRyb2tjeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/EtB1yylKGGAUg/giphy.gif')
          .setFooter({ text: 'Le nul est énervé 😠' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur dans presenceUpdate (Miguel):', error);
    }
  });
};

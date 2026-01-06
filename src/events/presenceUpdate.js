/**
 * @file Presence Update Event
 * @description Événement presenceUpdate pour un user
 * @param {Client} client - Le client Discord
 * @version 1.0.0
 */


const { EmbedBuilder } = require('discord.js');
const LOOSER_ID = process.env.LOOSER_ID;
const ACTIVITY_SALON_ID = process.env.ACTIVITY_SALON_ID;

module.exports = (client) => {
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    try {

      const channel = newPresence.guild.channels.cache.get(ACTIVITY_SALON_ID);
      if (!channel) return;

      // Vérifie l'user
      if (newPresence.userId !== LOOSER_ID) return;

      const oldStatus = oldPresence?.status || 'offline';
      const newStatus = newPresence.status;

      const guild = newPresence.guild;
      const member = await guild.members.fetch(LOOSER_ID).catch(() => null);
      
      if (!member) return;


      // Vérifie s'il vient de se connecter (était offline, maintenant online/idle/dnd)
      if (oldStatus === 'offline' && (newStatus === 'online' || newStatus === 'idle' || newStatus === 'dnd')) {
        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('👑 Le Nul est en ligne!')
          .setDescription(
            `✨ **${member.user.username}** vient de se connecter sur Discord!\n\n` +
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
          .setTitle(`👋 ${member.user.username} s'est déconnecté`)
          .setDescription(
            `🚪 **${member.user.username}** vient de se déconnecter de Discord\n\n` +
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
          .setTitle(`🚫 ${member.user.username} ne veut pas être dérangé`)
          .setDescription(
            `😡 **${member.user.username}** s'est mis en "Ne pas déranger"\n\n` +
            `*Le nul est en colère...*`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyY3JlaHB1OXNnMmRyd2x5OXZnNTZwMWFvOW9kOGFxOHdpZXRyb2tjeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/EtB1yylKGGAUg/giphy.gif')
          .setFooter({ text: 'Le nul est énervé 😠' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

      // Vérifie s'il vient de passer en "Inactif"
      if (oldStatus !== 'idle' && newStatus === 'idle') {
        const embed = new EmbedBuilder()
          .setColor(0xFFFF00)
          .setTitle(`💤 ${member.user.username} est maintenant inactif`)
          .setDescription(
            `😴 **${member.user.username}** s'est mis en "Inactif"\n\n` +
            `*Le nul est parti chier dans un coin de sa maison...*`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGQwNjBqYXpyc3ZpbjhwcWgxNDFrcW5ycHl5bDVwdnQwZ3VpMmpvaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Wds8J0sb4fnKo/giphy.gif')
          .setFooter({ text: 'Le nul se vide' })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur dans presenceUpdate :', error);
    }
  });
};

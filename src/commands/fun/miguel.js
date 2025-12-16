const { EmbedBuilder } = require('discord.js');

const MIGUEL_ID = '244865484065996800';

module.exports = {
  name: 'miguel',
  description: 'Vérifie si Miguel est en ligne',
  usage: '!miguel',
  
  async execute(message, args) {
    try {
      // Récupère le membre Miguel
      const miguel = await message.guild.members.fetch(MIGUEL_ID).catch(() => null);
      
      if (!miguel) {
        return message.reply('❌ Miguel n\'est pas sur ce serveur!');
      }

      // Vérifie son statut
      const isOnline = miguel.presence?.status === 'online' || miguel.presence?.status === 'idle' || miguel.presence?.status === 'dnd';
      const isInVoice = miguel.voice.channel !== null;

      if (isOnline) {
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('👑 Status de Miguel')
          .setDescription(
            `✅ **Miguel est en ligne!**\n\n` +
            `📊 **Statut**: ${miguel.presence?.status || 'unknown'}\n` +
            `${isInVoice ? `🔊 **Vocal**: ${miguel.voice.channel.name}` : '🔇 **Vocal**: Non connecté'}`
          )
          .setThumbnail(miguel.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://c.tenor.com/iu4JYPYUSmoAAAAd/tenor.gif')
          .setFooter({ text: 'Le nul est parmi nous' })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('👑 Status de Miguel')
          .setDescription('❌ **Miguel est hors ligne**\n\n*Le nul dort...*')
          .setThumbnail(miguel.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setFooter({ text: 'En attente du retour du nul' })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur dans la commande miguel:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

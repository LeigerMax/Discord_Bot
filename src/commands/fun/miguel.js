/**
 * @file Miguel Command
 * @description Vérifie le statut en ligne et vocal d'un utilisateur spécifique (Miguel)
 * @module commands/fun/miguel
 * @category Fun
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');
const LOOSER_ID = process.env.LOOSER_ID;

module.exports = {
  name: 'miguel',
  description: 'Vérifie si Miguel est en ligne',
  usage: '!miguel',
  
  async execute(message, _args) {
    try {
      // Récupère le membre 
      const user = await message.guild.members.fetch(LOOSER_ID).catch(() => null);
      
      if (!user) {
        return message.reply('❌ Miguel n\'est pas sur ce serveur!');
      }

      // Vérifie son statut
      const isOnline = user.presence?.status === 'online' || user.presence?.status === 'idle' || user.presence?.status === 'dnd';
      const isInVoice = user.voice.channel !== null;

      if (isOnline) {
        const embed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('👑 Status de Miguel')
          .setDescription(
            `✅ **Miguel est en ligne!**\n\n` +
            `📊 **Statut**: ${user.presence?.status || 'unknown'}\n` +
            `${isInVoice ? `🔊 **Vocal**: ${user.voice.channel.name}` : '🔇 **Vocal**: Non connecté'}`
          )
          .setThumbnail(user.user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setImage('https://c.tenor.com/iu4JYPYUSmoAAAAd/tenor.gif')
          .setFooter({ text: 'Le nul est parmi nous' })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('👑 Status de Miguel')
          .setDescription('❌ **Miguel est hors ligne**\n\n*Le nul dort...*')
          .setThumbnail(user.user.displayAvatarURL({ dynamic: true, size: 256 }))
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

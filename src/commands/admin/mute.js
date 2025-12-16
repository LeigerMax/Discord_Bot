const { EmbedBuilder } = require('discord.js');

// Map pour stocker les membres mutés et leurs timeouts
const mutedMembers = new Map();

module.exports = {
  name: 'mute',
  description: 'Mute un joueur dans le vocal pendant une durée définie (mute forcé)',
  usage: '!mute @utilisateur <durée_en_minutes>',
  
  async execute(message, args) {
    try {
      // Vérifie qu'un utilisateur est mentionné
      const mentionedUser = message.mentions.members.first();
      
      if (!mentionedUser) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois mentionner un utilisateur!\n' +
                   '**Exemple**: `!mute @utilisateur 5`'
        });
      }

      // Vérifie que la durée est fournie
      const duration = parseInt(args[1]);
      
      if (!duration || isNaN(duration) || duration < 1) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois spécifier une durée valide (en minutes)!\n' +
                   '**Exemple**: `!mute @utilisateur 5`'
        });
      }

      if (duration > 60) {
        return message.reply('❌ La durée maximale est de 60 minutes!');
      }

      // Vérifie que l'utilisateur est dans un salon vocal
      if (!mentionedUser.voice.channel) {
        return message.reply(`❌ ${mentionedUser.user.username} n'est pas dans un salon vocal!`);
      }

      // Vérifie si le membre est déjà muté par cette commande
      if (mutedMembers.has(mentionedUser.id)) {
        const muteInfo = mutedMembers.get(mentionedUser.id);
        const timeRemaining = Math.ceil((muteInfo.endTime - Date.now()) / 60000);
        return message.reply(
          `❌ ${mentionedUser.user.username} est déjà sous mute forcé!\n` +
          `⏱️ **Temps restant**: ${timeRemaining} minute(s)\n` +
          `💡 Attends que le mute actuel se termine.`
        );
      }

      // Crée un embed pour annoncer le mute
      const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('🔇 Mute Forcé')
        .setDescription(`🎯 **${mentionedUser.user.username}** va être muté!\n⏱️ **Durée**: ${duration} minute(s)`)
        .setFooter({ text: `Demandé par ${message.author.username}` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Attend 1 seconde
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mute le membre
      try {
        await mentionedUser.voice.setMute(true, `Mute forcé par ${message.author.username} - ${duration} min`);
        
        const endTime = Date.now() + (duration * 60000);
        
        // Système de surveillance pour remuter automatiquement
        const checkInterval = setInterval(async () => {
          try {
            // Récupère le membre à jour
            const currentMember = await message.guild.members.fetch(mentionedUser.id);
            
            // Vérifie si le membre est toujours dans un vocal
            if (!currentMember.voice.channel) {
              console.log(`${mentionedUser.user.username} a quitté le vocal`);
              clearInterval(checkInterval);
              mutedMembers.delete(mentionedUser.id);
              
              const leftEmbed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setDescription(`⚠️ **${mentionedUser.user.username}** a quitté le vocal - Mute annulé`);
              
              await message.channel.send({ embeds: [leftEmbed] });
              return;
            }

            // Si le temps est écoulé
            if (Date.now() >= endTime) {
              await currentMember.voice.setMute(false, 'Fin du mute forcé');
              clearInterval(checkInterval);
              mutedMembers.delete(mentionedUser.id);
              
              const unmutedEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`🔊 **${mentionedUser.user.username}** peut à nouveau parler!`)
                .setFooter({ text: 'Mute terminé' });
              
              await message.channel.send({ embeds: [unmutedEmbed] });
              return;
            }

            // Si le membre a enlevé son mute, on le remute
            if (!currentMember.voice.serverMute) {
              console.log(`Remute de ${mentionedUser.user.username}`);
              await currentMember.voice.setMute(true, 'Tentative de démute détectée - Mute forcé');
              
              // GIFs de moquerie
              const mockingGifs = [
                'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
                'https://media.giphy.com/media/OvL3qHSMO6uaI/giphy.gif',
                'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
                'https://media.giphy.com/media/APcFiiTrG0x2/giphy.gif',
                'https://media.giphy.com/media/1jkV5ifEE5EENHESRa/giphy.gif',
                'https://media.giphy.com/media/uUIFcDYRbvJTtxaFNa/giphy.gif',
                'https://media.giphy.com/media/26n6Gx9moCgs1pUuk/giphy.gif',
                'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif'
              ];
              
              const mockingMessages = [
                'Nice try! 😈',
                'Tu pensais vraiment t\'échapper? 😂',
                'Retente ta chance! 🤡',
                'Impossible mon ami! 🙈',
                'Tu rêves! 😏',
                'Pas aujourd\'hui! 🚫',
                'Trop facile! 😎',
                'T\'as cru? 💀'
              ];
              
              const randomGif = mockingGifs[Math.floor(Math.random() * mockingGifs.length)];
              const randomMessage = mockingMessages[Math.floor(Math.random() * mockingMessages.length)];
              
              const remutedEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`🚫 **${mentionedUser.user.username}** a essayé de se démute!`)
                .setImage(randomGif)
                .setFooter({ text: randomMessage });
              
              await message.channel.send({ embeds: [remutedEmbed] });
            }
          } catch (err) {
            console.error('Erreur lors de la vérification du mute:', err);
          }
        }, 1000); // Vérifie toutes les secondes

        // Stocke les informations du mute
        mutedMembers.set(mentionedUser.id, {
          interval: checkInterval,
          endTime: endTime,
          channelId: message.channel.id,
          mutedBy: message.author.id
        });

        const successEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('🔇 Mute Forcé Activé')
          .setDescription(
            `✅ **${mentionedUser.user.username}** a été muté!\n\n` +
            `⏱️ **Durée**: ${duration} minute(s)\n` +
            `🔓 **Fin**: <t:${Math.floor(endTime / 1000)}:R>\n` +
            `⚠️ **Mute forcé**: Impossible de se démute\n` +
            `👤 **Par**: ${message.author.username}`
          )
          .setFooter({ text: 'Toute tentative de démute sera sanctionnée' })
          .setTimestamp();
        
        await message.channel.send({ embeds: [successEmbed] });

      } catch (err) {
        console.error('Erreur lors du mute:', err);
        return message.reply('❌ Impossible de mute le membre. Vérifiez les permissions du bot.');
      }

    } catch (error) {
      console.error('Erreur dans la commande mute:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

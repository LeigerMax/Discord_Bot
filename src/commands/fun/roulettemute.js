/**
 * @file RouletteMute Command
 * @description Sélectionne un joueur aléatoire du vocal et le mute 5 minutes (mute forcé)
 * @version 1.0.0
 */

const { EmbedBuilder } = require('discord.js');

// Map pour stocker les membres mutés et leurs timeouts
const mutedMembers = new Map();

module.exports = {
  name: 'roulettemute',
  description: 'Sélectionne un joueur aléatoire du vocal et le mute 5 minutes (mute forcé)',
  usage: '!roulettemute',
  
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

      // Vérifie si le membre est déjà muté par cette commande
      if (mutedMembers.has(randomMember.id)) {
        return message.reply(`❌ ${randomMember.user.username} est déjà sous mute forcé!`);
      }

      // Crée un embed pour annoncer le résultat
      const embed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('🔇 Roulette Russe MUTE')
        .setDescription(`**${members.size}** joueurs dans le vocal...\n\n🎯 **${randomMember.user.username}** a été sélectionné!`)
        .setFooter({ text: 'Mute forcé pendant 5 minutes...' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      // Attend 2 secondes pour le suspense
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mute le membre
      try {
        await randomMember.voice.setMute(true, 'Roulette russe MUTE');
        
        const endTime = Date.now() + 300000; // 5 minutes
        
        // Système de surveillance pour remuter automatiquement
        const checkInterval = setInterval(async () => {
          try {
            // Récupère le membre à jour
            const currentMember = await message.guild.members.fetch(randomMember.id);
            
            // Vérifie si le membre est toujours dans un vocal
            if (!currentMember.voice.channel) {
              console.log(`${randomMember.user.username} a quitté le vocal`);
              clearInterval(checkInterval);
              mutedMembers.delete(randomMember.id);
              return;
            }

            // Si le temps est écoulé
            if (Date.now() >= endTime) {
              await currentMember.voice.setMute(false, 'Fin du mute forcé');
              clearInterval(checkInterval);
              mutedMembers.delete(randomMember.id);
              
              const unmutedEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`🔊 **${randomMember.user.username}** peut à nouveau parler!`)
                .setFooter({ text: 'Mute terminé' });
              
              await message.channel.send({ embeds: [unmutedEmbed] });
              return;
            }

            // Si le membre a enlevé son mute, on le remute
            if (!currentMember.voice.serverMute) {
              console.log(`Remute de ${randomMember.user.username}`);
              await currentMember.voice.setMute(true, 'Tentative de démute détectée - Roulette MUTE');
              
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
                .setDescription(`🚫 **${randomMember.user.username}** a essayé de se démute!`)
                .setImage(randomGif)
                .setFooter({ text: randomMessage });
              
              await message.channel.send({ embeds: [remutedEmbed] });
            }
          } catch (err) {
            console.error('Erreur lors de la vérification du mute:', err);
          }
        }, 1000); // Vérifie toutes les secondes

        // Stocke les informations du mute
        mutedMembers.set(randomMember.id, {
          interval: checkInterval,
          endTime: endTime,
          channelId: message.channel.id
        });

        const successEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('🔇 Mute Forcé Activé')
          .setDescription(
            `✅ **${randomMember.user.username}** a été muté!\n\n` +
            `⏱️ **Durée**: 5 minutes\n` +
            `🔓 **Fin**: <t:${Math.floor(endTime / 1000)}:R>\n` +
            `⚠️ **Mute forcé**: Impossible de se démute`
          )
          .setFooter({ text: 'Toute tentative de démute sera sanctionnée' })
          .setTimestamp();
        
        await message.channel.send({ embeds: [successEmbed] });

      } catch (err) {
        console.error('Erreur lors du mute:', err);
        return message.reply('❌ Impossible de mute le membre. Vérifiez les permissions du bot.');
      }

    } catch (error) {
      console.error('Erreur dans la commande roulettemute:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

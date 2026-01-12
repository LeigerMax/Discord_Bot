/**
 * Commande KING pour forcer l'arrêt de malédictions, mutes, etc.
 * Réservée uniquement au KING_ID
 * @param {Message} message - Le message Discord
 * @param {Array} args - Les arguments de la commande
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'override',
  description: '[KING ONLY] Force l\'arrêt de toutes les malédictions, mutes et sanctions',
  usage: '!override <curse|mute|roulettemute|all> [@utilisateur|all]',
  
  async execute(message, args) {
    try {
      // Vérifie que c'est le KING (lecture dynamique de process.env)
      const KING_ID = process.env.KING_ID;
      if (message.author.id !== KING_ID) {
        return message.reply('👑 Cette commande est réservée au ROI du serveur!');
      }

      const action = args[0]?.toLowerCase();
      const target = args[1]?.toLowerCase();

      if (!action) {
        return message.reply({
          content: '⚔️ **COMMANDE KING - OVERRIDE**\n\n' +
                   '**Syntaxe**: `!override <type> <cible>`\n\n' +
                   '**Types disponibles**:\n' +
                   '`curse` - Lève les malédictions\n' +
                   '`mute` - Démute forcé\n' +
                   '`roulettemute` - Arrête roulettemute\n' +
                   '`all` - Tout arrêter\n\n' +
                   '**Cibles**:\n' +
                   '`@utilisateur` - Pour un utilisateur spécifique\n' +
                   '`all` - Pour tous les utilisateurs\n\n' +
                   '**Exemples**:\n' +
                   '`!override curse @User` - Lève la malédiction de User\n' +
                   '`!override all all` - Arrête tout pour tout le monde'
        });
      }

      const mentionedUser = message.mentions.users.size > 0 ? message.mentions.users.values().next().value : null;
      const affectAll = target === 'all' || !mentionedUser;

      let results = {
        cursesRemoved: 0,
        mutesRemoved: 0,
        rouletteMutesRemoved: 0
      };

      // Récupère les modules via commandHandler
      const commands = message.client.commandHandler?.commands;
      if (!commands) {
        return message.reply('❌ Erreur: Impossible d\'accéder aux commandes.');
      }
      
      const curseCommand = commands.get('curse');
      const muteCommand = commands.get('mute');
      const roulettemuteCommand = commands.get('roulettemute');

      // Override CURSE
      if (action === 'curse' || action === 'all') {
        if (curseCommand && curseCommand.cursedPlayers) {
          const cursedPlayers = curseCommand.cursedPlayers;
          
          if (affectAll) {
            // Nettoie tous les timeouts avant de clear
            for (const [userId, curseData] of cursedPlayers) {
              if (curseData.timeout) clearTimeout(curseData.timeout);
            }
            results.cursesRemoved = cursedPlayers.size;
            cursedPlayers.clear();
          } else if (mentionedUser) {
            if (cursedPlayers.has(mentionedUser.id)) {
              const curseData = cursedPlayers.get(mentionedUser.id);
              if (curseData.timeout) clearTimeout(curseData.timeout);
              cursedPlayers.delete(mentionedUser.id);
              results.cursesRemoved = 1;
            }
          }
        }
      }

      // Override MUTE
      if (action === 'mute' || action === 'all') {
        if (muteCommand && muteCommand.mutedMembers) {
          const mutedMembers = muteCommand.mutedMembers;
          
          if (affectAll) {
            for (const [userId, muteData] of mutedMembers) {
              try {
                const member = await message.guild.members.fetch(userId).catch(() => null);
                if (member && member.voice.channel) {
                  await member.voice.setMute(false, 'Override par le KING');
                }
                if (muteData.interval) clearInterval(muteData.interval);
              } catch (err) {
                console.error('Erreur démute:', err);
              }
            }
            results.mutesRemoved = mutedMembers.size;
            mutedMembers.clear();
          } else if (mentionedUser) {
            if (mutedMembers.has(mentionedUser.id)) {
              const muteData = mutedMembers.get(mentionedUser.id);
              if (muteData.interval) clearInterval(muteData.interval);
              
              const member = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
              if (member && member.voice.channel) {
                await member.voice.setMute(false, 'Override par le KING');
              }
              
              mutedMembers.delete(mentionedUser.id);
              results.mutesRemoved = 1;
            }
          }
        }
      }

      // Override ROULETTE MUTE
      if (action === 'roulettemute' || action === 'all') {
        if (roulettemuteCommand && roulettemuteCommand.mutedMembers) {
          const mutedMembers = roulettemuteCommand.mutedMembers;
          
          if (affectAll) {
            for (const [userId, muteData] of mutedMembers) {
              try {
                const member = await message.guild.members.fetch(userId).catch(() => null);
                if (member && member.voice.channel) {
                  await member.voice.setMute(false, 'Override par le KING');
                }
                if (muteData.interval) clearInterval(muteData.interval);
              } catch (err) {
                console.error('Erreur démute roulette:', err);
              }
            }
            results.rouletteMutesRemoved = mutedMembers.size;
            mutedMembers.clear();
          } else if (mentionedUser) {
            if (mutedMembers.has(mentionedUser.id)) {
              const muteData = mutedMembers.get(mentionedUser.id);
              if (muteData.interval) clearInterval(muteData.interval);
              
              const member = await message.guild.members.fetch(mentionedUser.id).catch(() => null);
              if (member && member.voice.channel) {
                await member.voice.setMute(false, 'Override par le KING');
              }
              
              mutedMembers.delete(mentionedUser.id);
              results.rouletteMutesRemoved = 1;
            }
          }
        }
      }

      // Message de résultat
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('👑 OVERRIDE KING ACTIVÉ')
        .setDescription(
          `**Cible**: ${affectAll ? 'Tous les utilisateurs' : mentionedUser.username}\n` +
          `**Action**: ${action.toUpperCase()}\n\n` +
          `**Résultats**:\n` +
          `🔮 Malédictions levées: **${results.cursesRemoved}**\n` +
          `🔇 Mutes arrêtés: **${results.mutesRemoved}**\n` +
          `🎲 Roulette mutes arrêtés: **${results.rouletteMutesRemoved}**\n\n` +
          `✅ Toutes les sanctions ont été annulées par ordre royal!`
        )
        .setTimestamp()
        .setFooter({ text: `Exécuté par ${message.author.username}` });

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande override:', error);
      message.reply('❌ Une erreur est survenue lors de l\'override.');
    }
  }
};

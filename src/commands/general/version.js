/**
 * @file Version Command
 * @description Affiche la version actuelle du bot, les nouveautés et l'historique des versions
 * @module commands/general/version
 * @category General
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');
const versionData = require('../../config/version.json');

module.exports = {
  name: 'version',
  description: 'Affiche la version actuelle du bot et les nouveautés',
  usage: '!version [version]',
  
  async execute(message, args) {
    try {
      // Si un numéro de version est spécifié
      const requestedVersion = args[0];
      
      if (requestedVersion && versionData.changelog[requestedVersion]) {
        // Affiche les détails d'une version spécifique
        const versionInfo = versionData.changelog[requestedVersion];
        
        const embed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle(`📜 Historique - Version ${requestedVersion}`)
          .setDescription(`Publiée le ${versionInfo.date}`)
          .setFooter({ text: `Version actuelle: ${versionData.current}` })
          .setTimestamp();

        if (versionInfo.features.length > 0) {
          embed.addFields({
            name: '✨ Nouveautés',
            value: versionInfo.features.map(f => `• ${f}`).join('\n')
          });
        }

        if (versionInfo.fixes.length > 0) {
          embed.addFields({
            name: '🐛 Corrections',
            value: versionInfo.fixes.map(f => `• ${f}`).join('\n')
          });
        }

        return message.reply({ embeds: [embed] });
      }

      // Affiche la version actuelle
      const currentVersionInfo = versionData.changelog[`v${versionData.current}`];
      const allVersions = Object.keys(versionData.changelog).reverse().slice(0, 5);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🤖 Nexus Bot v${versionData.current}`)
        .setDescription(`Version publiée le ${versionData.releaseDate}`)
        .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: `Demandé par ${message.author.username}` })
        .setTimestamp();

      // Nouveautés de la version actuelle
      if (currentVersionInfo && currentVersionInfo.features.length > 0) {
        embed.addFields({
          name: '✨ Nouveautés de cette version',
          value: currentVersionInfo.features.map(f => `• ${f}`).join('\n')
        });
      }

      // Corrections de la version actuelle
      if (currentVersionInfo && currentVersionInfo.fixes.length > 0) {
        embed.addFields({
          name: '🐛 Corrections',
          value: currentVersionInfo.fixes.map(f => `• ${f}`).join('\n')
        });
      }

      // Historique des versions
      embed.addFields({
        name: '📜 Versions récentes',
        value: allVersions.map(v => `\`${v}\` - ${versionData.changelog[v].date}`).join('\n') +
               `\n\n*Utilise \`!version ${allVersions[1]}\` pour voir les détails*`
      });

      // Informations
      embed.addFields({
        name: '🔗 Informations',
        value: `Développé par **${versionData.developer}**\nPréfixe: \`${versionData.prefix}\``
      });

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande version:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage de la version.');
    }
  },
};

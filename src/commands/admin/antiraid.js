/**
 * @file Antiraid Command
 * @description Système anti-raid personnalisable pour protéger le serveur contre les raids massifs
 * @module commands/admin/antiraid
 * @category Admin
 * @requires discord.js
 */

const { EmbedBuilder } = require('discord.js');

// Configuration anti-raid par serveur
const antiRaidConfig = new Map();

// Tracking des joins récents
const recentJoins = new Map();

// Garbage collector: nettoie les anciennes entrées toutes les 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [guildId, joins] of recentJoins) {
    const filtered = joins.filter(j => now - j.timestamp < 60000); // Garde uniquement les joins de la dernière minute
    if (filtered.length === 0) {
      recentJoins.delete(guildId);
    } else {
      recentJoins.set(guildId, filtered);
    }
  }
}, 10 * 60 * 1000);

module.exports = {
  name: 'antiraid',
  description: 'Configure le système anti-raid du serveur',
  usage: '!antiraid <on|off|config|status>',
  
  async execute(message, args) {
    try {
      // Vérifie les permissions
      if (!message.member.permissions.has('Administrator')) {
        return message.reply('❌ Tu dois être administrateur pour configurer l\'anti-raid!');
      }

      const subCommand = args[0]?.toLowerCase();

      if (!subCommand || subCommand === 'status') {
        return this.showStatus(message);
      }

      switch (subCommand) {
        case 'on':
          return this.enableAntiRaid(message);
        
        case 'off':
          return this.disableAntiRaid(message);
        
        case 'config':
          return this.configureAntiRaid(message, args.slice(1));
        
        default:
          return message.reply({
            content: '❌ Sous-commande invalide!\n' +
                     '**Commandes disponibles**:\n' +
                     '`!antiraid on` - Active l\'anti-raid\n' +
                     '`!antiraid off` - Désactive l\'anti-raid\n' +
                     '`!antiraid config <option> <valeur>` - Configure l\'anti-raid\n' +
                     '`!antiraid status` - Affiche la configuration actuelle\n\n' +
                     '**Options de config**:\n' +
                     '`joinLimit <nombre>` - Nombre de joins max en X secondes (défaut: 5)\n' +
                     '`joinWindow <secondes>` - Fenêtre de temps pour les joins (défaut: 10)\n' +
                     '`action <kick|ban>` - Action à effectuer (défaut: kick)\n' +
                     '`autoLock <true|false>` - Verrouille automatiquement le serveur (défaut: true)'
          });
      }

    } catch (error) {
      console.error('Erreur dans la commande antiraid:', error);
      message.reply('❌ Une erreur est survenue.');
    }
  },

  enableAntiRaid(message) {
    const guildId = message.guild.id;
    
    if (!antiRaidConfig.has(guildId)) {
      antiRaidConfig.set(guildId, {
        enabled: true,
        joinLimit: 5,
        joinWindow: 10000, // 10 secondes
        action: 'kick',
        autoLock: true,
        locked: false
      });
    } else {
      const config = antiRaidConfig.get(guildId);
      config.enabled = true;
      config.locked = false;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🛡️ Anti-Raid Activé')
      .setDescription('Le système anti-raid est maintenant actif!')
      .addFields(
        { name: '⚙️ Configuration', value: this.getConfigText(antiRaidConfig.get(guildId)) }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },

  disableAntiRaid(message) {
    const guildId = message.guild.id;
    const config = antiRaidConfig.get(guildId);
    
    if (config) {
      config.enabled = false;
      config.locked = false;
    }

    return message.reply('✅ Système anti-raid désactivé!');
  },

  async configureAntiRaid(message, args) {
    const guildId = message.guild.id;
    
    if (!antiRaidConfig.has(guildId)) {
      antiRaidConfig.set(guildId, {
        enabled: false,
        joinLimit: 5,
        joinWindow: 10000,
        action: 'kick',
        autoLock: true,
        locked: false
      });
    }

    const config = antiRaidConfig.get(guildId);
    const option = args[0]?.toLowerCase();
    const value = args[1];

    if (!option) {
      return message.reply('❌ Spécifie une option à configurer! Utilise `!antiraid` pour voir la liste.');
    }

    switch (option) {
      case 'joinlimit': {
        const limit = Number.parseInt(value, 10);
        if (!limit || limit < 1 || limit > 20) {
          return message.reply('❌ La limite de joins doit être entre 1 et 20!');
        }
        config.joinLimit = limit;
        return message.reply(`✅ Limite de joins définie à **${limit}** utilisateurs.`);
      }

      case 'joinwindow': {
        const window = Number.parseInt(value, 10);
        if (!window || window < 5 || window > 60) {
          return message.reply('❌ La fenêtre de temps doit être entre 5 et 60 secondes!');
        }
        config.joinWindow = window * 1000;
        return message.reply(`✅ Fenêtre de temps définie à **${window}** secondes.`);
      }

      case 'action':
        if (value !== 'kick' && value !== 'ban') {
          return message.reply('❌ L\'action doit être `kick` ou `ban`!');
        }
        config.action = value;
        return message.reply(`✅ Action anti-raid définie à **${value}**.`);

      case 'autolock':
        if (value !== 'true' && value !== 'false') {
          return message.reply('❌ AutoLock doit être `true` ou `false`!');
        }
        config.autoLock = value === 'true';
        return message.reply(`✅ Verrouillage automatique ${config.autoLock ? 'activé' : 'désactivé'}.`);

      default:
        return message.reply('❌ Option invalide! Utilise `!antiraid` pour voir les options disponibles.');
    }
  },

  showStatus(message) {
    const guildId = message.guild.id;
    const config = antiRaidConfig.get(guildId);

    const embed = new EmbedBuilder()
      .setColor(config?.enabled ? 0x00FF00 : 0xFF0000)
      .setTitle('🛡️ Statut Anti-Raid')
      .setDescription(
        config?.enabled 
          ? '✅ **Système actif**' + (config.locked ? ' 🔒 **SERVEUR VERROUILLÉ**' : '')
          : '❌ **Système désactivé**'
      )
      .setTimestamp();

    if (config) {
      embed.addFields(
        { name: '⚙️ Configuration', value: this.getConfigText(config) }
      );
    }

    return message.reply({ embeds: [embed] });
  },

  getConfigText(config) {
    return `**Limite**: ${config.joinLimit} joins en ${config.joinWindow / 1000}s\n` +
           `**Action**: ${config.action}\n` +
           `**Auto-Lock**: ${config.autoLock ? 'Oui' : 'Non'}`;
  },

  // Fonction appelée par l'event guildMemberAdd
  async checkRaid(guild, member) {
    const config = antiRaidConfig.get(guild.id);
    
    if (!config || !config.enabled || config.locked) return;

    const now = Date.now();
    
    if (!recentJoins.has(guild.id)) {
      recentJoins.set(guild.id, []);
    }

    const joins = recentJoins.get(guild.id);
    
    // Ajoute le nouveau join
    joins.push({ userId: member.id, timestamp: now });

    // Nettoie les anciens joins
    const filtered = joins.filter(j => now - j.timestamp < config.joinWindow);
    recentJoins.set(guild.id, filtered);

    // Vérifie si raid détecté
    if (filtered.length >= config.joinLimit) {
      console.log(`[ANTI-RAID] Raid détecté sur ${guild.name}! ${filtered.length} joins en ${config.joinWindow / 1000}s`);
      
      // Action sur tous les membres récents
      for (const join of filtered) {
        try {
          const targetMember = await guild.members.fetch(join.userId).catch(() => null);
          if (!targetMember) continue;

          if (config.action === 'ban') {
            await targetMember.ban({ reason: 'Anti-Raid: Détection de raid' });
          } else {
            await targetMember.kick('Anti-Raid: Détection de raid');
          }
        } catch (err) {
          console.error('Erreur action anti-raid:', err);
        }
      }

      // Verrouille le serveur si activé
      if (config.autoLock) {
        config.locked = true;
        
        // Trouve un salon pour notifier
        const channels = guild.channels.cache.filter(c => c.type === 0);
        const notifChannel = channels.first();
        
        if (notifChannel) {
          const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🚨 RAID DÉTECTÉ!')
            .setDescription(
              `**${filtered.length}** membres ont rejoint en ${config.joinWindow / 1000} secondes!\n\n` +
              `✅ Action effectuée: **${config.action}**\n` +
              `🔒 Serveur verrouillé automatiquement\n\n` +
              `Utilise \`!antiraid off\` puis \`!antiraid on\` pour déverrouiller.`
            )
            .setTimestamp();

          await notifChannel.send({ embeds: [embed] }).catch(() => {});
        }
      }

      // Nettoie les joins
      recentJoins.set(guild.id, []);
    }
  },

  // Export de la config pour l'event
  getConfig(guildId) {
    return antiRaidConfig.get(guildId);
  }
};

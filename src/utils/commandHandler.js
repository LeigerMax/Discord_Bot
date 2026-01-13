/**
 * @file Command Handler Utility
 * @description Gestionnaire de commandes qui charge automatiquement toutes les commandes et gère leur exécution avec système de cooldown
 * @module utils/commandHandler
 * @requires node:fs
 * @requires node:path
 */

const fs = require('node:fs');
const path = require('node:path');

class CommandHandler {
  constructor(client, prefix) {
    this.client = client;
    this.prefix = prefix;
    this.commands = new Map();
  }

  /**
   * Charge toutes les commandes depuis le dossier commands
   * @param {string} commandsPath - Chemin vers le dossier commands
   */
  loadCommands(commandsPath) {
    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      
      // Vérifie que c'est un dossier
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        
        try {
          const command = require(filePath);
          
          if ('name' in command && 'execute' in command) {
            this.commands.set(command.name, command);
            console.log(`Commande chargée: ${command.name} (${category})`);
          } else {
            console.warn(`${file} ne contient pas de propriétés 'name' ou 'execute'`);
          }
        } catch (error) {
          console.error(`Erreur lors du chargement de ${file}:`, error);
        }
      }
    }

    console.log(`\nTotal: ${this.commands.size} commande(s) chargée(s)\n`);
  }

  /**
   * Trouve les commandes similaires basées sur la distance de Levenshtein
   * @param {string} input - La commande entrée par l'utilisateur
   * @returns {Array<string>} - Liste des commandes similaires triées par pertinence
   */
  findSimilarCommands(input) {
    const commandNames = Array.from(this.commands.keys());
    const suggestions = [];

    for (const cmdName of commandNames) {
      // Distance de Levenshtein simplifiée
      const distance = this.levenshteinDistance(input, cmdName);
      
      // Si la distance est faible (3 ou moins) ou si le début correspond
      if (distance <= 3 || cmdName.startsWith(input) || input.startsWith(cmdName)) {
        suggestions.push({ name: cmdName, distance });
      }
    }

    // Trie par distance (les plus proches en premier)
    suggestions.sort((a, b) => a.distance - b.distance);
    
    return suggestions.map(s => s.name);
  }

  /**
   * Calcule la distance de Levenshtein entre deux chaînes
   * @param {string} a - Première chaîne
   * @param {string} b - Deuxième chaîne
   * @returns {number} - Distance de Levenshtein
   */
  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // suppression
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Traite un message et exécute la commande si elle existe
   * @param {Message} message - Le message Discord
   */
  async handleMessage(message) {
    // Ignore les messages des bots
    if (message.author.bot) return;

    // Vérifie si le message commence par le préfixe
    if (!message.content.startsWith(this.prefix)) return;

    // Parse le message
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Récupère la commande
    const command = this.commands.get(commandName);
    
    // Si la commande n'existe pas, suggère des alternatives
    if (!command) {
      const suggestions = this.findSimilarCommands(commandName);
      if (suggestions.length > 0) {
        const suggestionsList = suggestions.slice(0, 5).map(cmd => `\`${this.prefix}${cmd}\``).join(', ');
        return message.reply({
          content: `❌ Commande \`${commandName}\` introuvable.\n💡 **Suggestions**: ${suggestionsList}\n\nUtilise \`${this.prefix}help\` pour voir toutes les commandes.`,
          allowedMentions: { repliedUser: false }
        });
      }
      return; // Pas de suggestions, ignore silencieusement
    }

    // Vérifie si le joueur est maudit
    const curseCommand = this.commands.get('curse');
    if (curseCommand?.isCursed(message.author.id)) {
      const curseType = curseCommand.getCurseType(message.author.id);
      
      // Malédiction: Ignoré
      if (curseType === 'IGNORED') {
        return; // Ignore complètement le message
      }
      
      // Malédiction: Bloqué
      if (curseType === 'BLOCKED') {
        return message.reply('🚫 Tu es maudit! Aucune commande ne fonctionne pour toi...');
      }
      
      // Malédiction: Réponses aléatoires
      if (curseType === 'RANDOM_RESPONSES') {
        return message.reply(curseCommand.getRandomResponse());
      }
      
      // Malédiction: Messages déformés (inverse la commande)
      if (curseType === 'GARBLED') {
        const garbledMsg = message.content.split('').reverse().join('');
        return message.reply(`🔀 Ta commande a été déformée: \`${garbledMsg}\``);
      }
      
      // Malédiction: Mode lent
      if (curseType === 'SLOW_MODE') {
        message.reply('🐌 Traitement en cours... *lentement*');
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondes
      }
      
      // Malédiction: Commandes inversées
      if (curseType === 'REVERSED') {
        // Si la commande mentionne quelqu'un, inverse la cible vers le maudit
        if (message.mentions.users.size > 0) {
          // Liste des commandes qui peuvent être inversées
          const reversibleCommands = ['curse', 'mute', 'spam', 'slap', 'hug', 'kiss'];
          
          if (reversibleCommands.includes(commandName)) {
            // Remplace la première mention par celle du joueur maudit
            const newArgs = args.slice();
            newArgs[0] = `<@${message.author.id}>`;
            
            message.channel.send(`🔄 **Commande inversée!** ${message.author}, tu voulais cibler quelqu'un mais c'est toi la cible maintenant! 😈`);
            
            // Exécute la commande avec la cible inversée
            try {
              await command.execute(message, newArgs);
              return;
            } catch (error) {
              console.error(`Erreur lors de l'exécution inversée de ${commandName}:`, error);
              return message.reply('🔄 L\'inversion de la commande a échoué... Tu as de la chance cette fois!');
            }
          }
        }
        
        // Pour les autres commandes sans cible, juste un message
        return message.reply(`🔄 Commande inversée! Je fais l'opposé de \`${commandName}\`... ou rien du tout! 😈`);
      }
      
      // Les autres malédictions (PUBLIC_SHAME, SPAM, VOICE_MUTE, WORST_LUCK) 
      // n'empêchent pas l'exécution mais modifient le comportement
    }

    try {
      // Exécute la commande
      await command.execute(message, args);
      
      // Si le joueur est maudit avec WORST_LUCK, modifie les résultats après exécution
      if (curseCommand?.isCursed(message.author.id)) {
        const curseType = curseCommand.getCurseType(message.author.id);
        
        if (curseType === 'WORST_LUCK') {
          // Pour les commandes de hasard, on informe que le résultat était le pire
          const randomCommands = ['dice', 'roll', 'coin', 'random', 'roulette'];
          if (randomCommands.includes(commandName)) {
            setTimeout(() => {
              message.channel.send(`💀 ${message.author} est maudit! Le résultat était forcément le pire possible... 😈`);
            }, 500);
          }
        }
      }
      
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
      
      try {
        await message.reply({
          content: 'Une erreur est survenue lors de l\'exécution de cette commande.'
        });
      } catch (replyError) {
        console.error('Impossible d\'envoyer le message d\'erreur:', replyError);
      }
    }
  }


}

module.exports = CommandHandler;

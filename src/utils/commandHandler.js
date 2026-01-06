/**
 * Gestionnaire de commandes pour Discord Bot
 * Charge et exécute les commandes basées sur les messages reçus
 * @param {Client} client - Le client Discord
 * @param {string} prefix - Le préfixe des commandes
 **/

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
    if (!command) return;

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

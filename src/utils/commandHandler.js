const fs = require('fs');
const path = require('path');

/**
 * Gestionnaire de commandes pour Discord Bot
 */
class CommandHandler {
  constructor(client, prefix = '!') {
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
            console.log(`✅ Commande chargée: ${command.name} (${category})`);
          } else {
            console.warn(`⚠️  ${file} ne contient pas de propriétés 'name' ou 'execute'`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors du chargement de ${file}:`, error);
        }
      }
    }

    console.log(`\n📦 Total: ${this.commands.size} commande(s) chargée(s)\n`);
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

    try {
      // Exécute la commande
      await command.execute(message, args);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
      
      try {
        await message.reply({
          content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.'
        });
      } catch (replyError) {
        console.error('Impossible d\'envoyer le message d\'erreur:', replyError);
      }
    }
  }

  /**
   * Recharge une commande spécifique
   * @param {string} commandName - Nom de la commande à recharger
   */
  reloadCommand(commandName) {
    const command = this.commands.get(commandName);
    if (!command) return false;

    // Trouve le chemin du fichier de la commande
    const commandsPath = path.join(__dirname, '../commands');
    const categories = fs.readdirSync(commandsPath);

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      const filePath = path.join(categoryPath, `${commandName}.js`);

      if (fs.existsSync(filePath)) {
        delete require.cache[require.resolve(filePath)];
        
        try {
          const newCommand = require(filePath);
          this.commands.set(commandName, newCommand);
          console.log(`🔄 Commande rechargée: ${commandName}`);
          return true;
        } catch (error) {
          console.error(`Erreur lors du rechargement de ${commandName}:`, error);
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Liste toutes les commandes disponibles
   * @returns {Map} - Map des commandes
   */
  getCommands() {
    return this.commands;
  }
}

module.exports = CommandHandler;

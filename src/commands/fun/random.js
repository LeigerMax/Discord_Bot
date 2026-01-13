/**
 * @file Random Command
 * @description Choisit une option au hasard parmi celles fournies avec support des guillemets pour options multimots
 * @module commands/fun/random
 * @category Fun
 */

module.exports = {
  name: 'random',
  description: 'Choisit une option au hasard parmi celles fournies',
  usage: '!random <option1> <option2> [option3] ... ou !random "option avec espaces" "autre option"',
  
  execute(message, args) {
    try {
      // Parse les arguments en gérant les guillemets
      const parsedArgs = parseArgs(args.join(' '));

      // Validation: au moins 2 options
      if (parsedArgs.length < 2) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois fournir au moins 2 options!\n' +
                   '**Exemple**: `!random pizza burger tacos`\n' +
                   '**Avec espaces**: `!random "option 1" "option 2"`'
        });
      }

      // Validation: nombre maximum d'options (évite le spam)
      if (parsedArgs.length > 25) {
        return message.reply('❌ **Erreur**: Maximum 25 options autorisées!');
      }

      // Validation: options non vides
      const validOptions = parsedArgs.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        return message.reply('❌ **Erreur**: Les options ne peuvent pas être vides!');
      }

      // Sélection aléatoire
      const choice = validOptions[Math.floor(Math.random() * validOptions.length)];
      
      // Réponse formatée
      const optionsList = validOptions.map(opt => `• ${opt}`).join('\n');
      message.reply({
        content: `🎲 **Random Choice**\n\n` +
                 `**Options** (${validOptions.length}):\n${optionsList}\n\n` +
                 `✨ **Je choisis**: **${choice}**`
      });

    } catch (error) {
      console.error('Erreur dans la commande random:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

/**
 * Parse les arguments en gérant les guillemets pour les options avec espaces
 * @param {string} input - La chaîne d'arguments à parser
 * @returns {Array<string>} - Tableau des options parsées
 */
function parseArgs(input) {
  const regex = /"([^"]+)"|'([^']+)'|(\S+)/g;
  const result = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    // Récupère le contenu entre guillemets doubles, simples, ou le mot
    result.push(match[1] || match[2] || match[3]);
  }
  
  return result;
}

/**
 * @file Auto Feur Event
 * @description Répond "feur" aux messages se terminant par "quoi"
 * @version 1.0.0
 */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const content = message.content.toLowerCase().trim();
    
    if (content.endsWith('quoi') || content.endsWith('quoi?') || content === 'quoi') {
      try {
        await message.reply('feur');
      } 
      catch (error) {
        console.error('Erreur lors de la réponse feur:', error);
      }
    }
  });
};
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'keyboard',
  description: 'Vérifie l\'état de ton clavier',
  usage: '!keyboard [@utilisateur]',
  
  async execute(message, args) {
    try {
      // Vérifie si un utilisateur est mentionné, sinon utilise l'auteur
      const targetUser = message.mentions.users.first() || message.author;
      
      // États possibles du clavier
      const states = [
        { emoji: '⌨️', status: 'Clavier intact', description: 'Aucun dégât détecté', color: 0x00FF00, chance: 30 },
        { emoji: '⌨️', status: 'Touches collantes', description: '1 touche coincée (probablement du soda)', color: 0x99FF99, chance: 20 },
        { emoji: '⌨️', status: '3 touches arrachées', description: 'W, A, S ou D manquent à l\'appel', color: 0xFFFF00, chance: 20 },
        { emoji: '⌨️', status: 'Barre espace fissurée', description: 'Tu jump trop fort', color: 0xFF9900, chance: 15 },
        { emoji: '🔥', status: 'Clavier en feu', description: 'Il chauffe grave', color: 0xFF0000, chance: 10 },
        { emoji: '💀', status: 'Clavier détruit (RIP)', description: 'Coup de poing critique confirmé', color: 0x8B0000, chance: 5 }
      ];

      // Sélection pondérée
      const totalChance = states.reduce((sum, state) => sum + state.chance, 0);
      let random = Math.random() * totalChance;
      let selectedState;

      for (const state of states) {
        random -= state.chance;
        if (random <= 0) {
          selectedState = state;
          break;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(selectedState.color)
        .setTitle('⌨️ État du Clavier')
        .setDescription(
          `**Joueur**: ${targetUser.username}\n\n` +
          `${selectedState.emoji} **${selectedState.status}**\n` +
          `*${selectedState.description}*`
        )
        .setFooter({ text: 'Diagnostic complet effectué' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande keyboard:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'wifi',
  description: 'Vérifie la qualité de ta connexion',
  usage: '!wifi [@utilisateur]',
  
  async execute(message, args) {
    try {
      // Vérifie si un utilisateur est mentionné, sinon utilise l'auteur
      const targetUser = message.mentions.users.first() || message.author;
      
      // États possibles de connexion
      const states = [
        { emoji: '📶', ping: '12', status: 'Fibre optique', description: 'Connexion parfaite', color: 0x00FF00, chance: 15 },
        { emoji: '📶', ping: '35', status: 'Excellent', description: 'Ping ultra stable', color: 0x00FF00, chance: 20 },
        { emoji: '📶', ping: '89', status: 'Jouable', description: 'Quelques microlags', color: 0xFFFF00, chance: 25 },
        { emoji: '📶', ping: '145', status: 'Moyen', description: 'Commence à sentir le delay', color: 0xFF9900, chance: 20 },
        { emoji: '📶', ping: '240', status: 'Injouable', description: 'Teleport detected', color: 0xFF0000, chance: 15 },
        { emoji: '📶', ping: '999', status: 'Catastrophique', description: 'Internet Explorer vibes', color: 0x8B0000, chance: 4 },
        { emoji: '📶', ping: '∞', status: 'Ping infini', description: 'Rollback detected', color: 0x000000, chance: 1 }
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

      // Crée des barres de signal
      const signalBars = selectedState.ping === '∞' || parseInt(selectedState.ping) > 200 
        ? '▂▁▁' 
        : parseInt(selectedState.ping) > 100 
        ? '▂▄▁' 
        : '▂▄▆█';

      const embed = new EmbedBuilder()
        .setColor(selectedState.color)
        .setTitle('📶 Qualité de Connexion')
        .setDescription(
          `**Joueur**: ${targetUser.username}\n\n` +
          `${selectedState.emoji} **${selectedState.ping} ms** ${signalBars}\n\n` +
          `**État**: ${selectedState.status}\n` +
          `*${selectedState.description}*`
        )
        .setFooter({ text: 'Test de vitesse effectué' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande wifi:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

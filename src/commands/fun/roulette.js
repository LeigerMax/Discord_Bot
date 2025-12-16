const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roulette',
  description: 'Sélectionne un joueur aléatoire du vocal et le déconnecte',
  usage: '!roulette',
  
  async execute(message, args) {
    try {
      // Vérifie que l'utilisateur est dans un salon vocal
      if (!message.member.voice.channel) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois être dans un salon vocal pour utiliser cette commande!'
        });
      }

      const voiceChannel = message.member.voice.channel;
      
      // Récupère tous les membres du salon vocal (sauf les bots)
      const members = voiceChannel.members.filter(member => !member.user.bot);
      
      if (members.size === 0) {
        return message.reply('❌ Aucun joueur dans le salon vocal!');
      }

      if (members.size === 1) {
        return message.reply('❌ Tu es seul dans le vocal! Il faut au moins 2 joueurs.');
      }

      // Sélectionne un membre aléatoire
      const randomMember = members.random();

      // Crée un embed pour annoncer le résultat
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🎲 Roulette Russe')
        .setDescription(`**${members.size}** joueurs dans le vocal...\n\n🔫 **${randomMember.user.username}** a été sélectionné!`)
        .setFooter({ text: 'Déconnexion en cours...' })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      // Attend 2 secondes pour le suspense
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Déconnecte le membre sélectionné
      try {
        await randomMember.voice.disconnect('Roulette russe');
        
        const successEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setDescription(`✅ **${randomMember.user.username}** a été déconnecté du vocal!`)
          .setTimestamp();
        
        await message.channel.send({ embeds: [successEmbed] });
      } catch (err) {
        console.error('Erreur lors de la déconnexion:', err);
        return message.reply('❌ Impossible de déconnecter le membre. Vérifiez les permissions du bot.');
      }

    } catch (error) {
      console.error('Erreur dans la commande roulette:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

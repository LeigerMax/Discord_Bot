/**
 * Commande: play
 * Joue de la musique depuis YouTube, SoundCloud, Spotify, etc.
 * Utilise discord-player v7 avec la méthode player.play()
 */

const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'play',
  category: 'music',
  description: 'Joue une musique depuis YouTube ou autre plateforme',
  usage: '!play <recherche ou URL>',
  
  async execute(message, args) {
    // Récupère le player via le hook useMainPlayer()
    const player = useMainPlayer();
    
    // Vérifie que l'utilisateur est dans un salon vocal
    const channel = message.member?.voice?.channel;
    if (!channel) {
      return message.reply('❌ Vous devez être dans un salon vocal!');
    }
    
    // Vérifie qu'une recherche ou URL est fournie
    const query = args.join(' ');
    if (!query) {
      return message.reply('❌ Veuillez fournir une recherche ou un lien!\n**Exemple:** `!play never gonna give you up`');
    }
    
    try {
      // Lance la recherche et la lecture avec player.play()
      // Cette méthode gère automatiquement:
      // - La recherche de la musique
      // - La connexion au salon vocal
      // - La création de la queue
      // - L'ajout du track et le démarrage de la lecture
      const { track } = await player.play(channel, query, {
        nodeOptions: {
          // metadata sera accessible via queue.metadata
          metadata: message.channel
        }
      });
      
      return message.reply(`✅ **${track.title}** ajouté à la queue!`);
      
    } catch (error) {
      console.error('Erreur play:', error);
      return message.reply(`❌ Erreur: ${error.message}`);
    }
  }
};

/**
 * @file Queue Command
 * @description Affiche la file d'attente des musiques en cours de lecture
 * @module commands/music/queue
 * @category Music
 * @requires discord-player
 */

const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'queue',
  category: 'music',
  description: 'Affiche la file d\'attente des musiques',
  usage: '!queue',
  
  async execute(message, _args) {
    const player = useMainPlayer();
    const queue = player.queues.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ Aucune musique en cours!');
    }

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.data.slice(0, 10);

    let response = `**🎵 En cours:**\n${currentTrack.title}\n\n`;
    
    if (tracks.length) {
      response += `**Suivant:**\n`;
      response += tracks.map((track, i) => `${i + 1}. ${track.title}`).join('\n');
    } else {
      response += `*File vide*`;
    }
    
    response += `\n\n**Total:** ${queue.tracks.data.length} musique(s) en attente`;
    
    return message.reply(response);
  }
};

/**
 * @file Skip Command
 * @description Passe à la musique suivante dans la file d'attente
 * @module commands/music/skip
 * @category Music
 * @requires discord-player
 */

const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'skip',
  category: 'music',
  description: 'Passe à la musique suivante',
  usage: '!skip',
  
  async execute(message, _args) {
    const player = useMainPlayer();
    const queue = player.queues.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ Aucune musique en cours!');
    }

    const currentTrack = queue.currentTrack;
    queue.node.skip();
    
    return message.reply(`⏭️ **${currentTrack.title}** ignorée!`);
  }
};

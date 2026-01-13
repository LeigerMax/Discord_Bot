/**
 * @file Stop Command
 * @description Arrête la musique en cours et vide la file d'attente
 * @module commands/music/stop
 * @category Music
 * @requires discord-player
 */

const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'stop',
  category: 'music',
  description: 'Arrête la musique et vide la file',
  usage: '!stop',
  
  async execute(message, _args) {
    const player = useMainPlayer();
    const queue = player.queues.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ Aucune musique en cours!');
    }

    queue.delete();
    return message.reply('⏹️ Musique arrêtée et file vidée!');
  }
};

const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'stop',
  category: 'music',
  description: 'Arrête la musique et vide la file',
  usage: '!stop',
  
  async execute(message, args) {
    const player = useMainPlayer();
    const queue = player.queues.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ Aucune musique en cours!');
    }

    queue.delete();
    return message.reply('⏹️ Musique arrêtée et file vidée!');
  }
};

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Affiche la latence du bot',
  usage: '!ping',
  
  async execute(message, args) {
    try {
      // Calcule la latence du bot
      const sent = await message.reply('🏓 Calcul de la latence...');
      const timeDiff = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(message.client.ws.ping);

      // Détermine la qualité de la connexion
      let quality;
      let color;
      if (timeDiff < 100) {
        quality = 'Excellente';
        color = 0x00FF00;
      } else if (timeDiff < 200) {
        quality = 'Bonne';
        color = 0xFFFF00;
      } else if (timeDiff < 500) {
        quality = 'Moyenne';
        color = 0xFF9900;
      } else {
        quality = 'Mauvaise';
        color = 0xFF0000;
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '⏱️ Latence du Bot', value: `\`${timeDiff}ms\``, inline: true },
          { name: '📡 Latence API', value: `\`${apiLatency}ms\``, inline: true },
          { name: '📊 Qualité', value: `\`${quality}\``, inline: true }
        )
        .setFooter({ text: `Demandé par ${message.author.username}` })
        .setTimestamp();

      await sent.edit({ content: null, embeds: [embed] });

    } catch (error) {
      console.error('Erreur dans la commande ping:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

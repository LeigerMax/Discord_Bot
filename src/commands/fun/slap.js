/**
 * @file Slap Command
 * @description Envoie un GIF de tape à un utilisateur via Giphy API avec mode secret optionnel
 * @module commands/fun/slap
 * @category Fun
 * @requires discord.js
 * @requires node-fetch
 */

const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { trackDM } = require('../../events/dmReply');

module.exports = {
  name: 'slap',
  description: 'Envoie un GIF de tape à un utilisateur (blague)',
  usage: '!slap @utilisateur [secret]',
  
  async execute(message, args) {
    try {
      // Vérifie qu'un utilisateur est mentionné
      const mentionedUser = message.mentions.users.first();
      
      if (!mentionedUser) {
        return message.reply({
          content: '❌ **Erreur**: Tu dois mentionner un utilisateur!\n' +
                   '**Exemple**: `!slap @utilisateur` ou `!slap @utilisateur secret`'
        });
      }

      // Vérifie que l'utilisateur ne se mentionne pas lui-même
      if (mentionedUser.id === message.author.id) {
        return message.reply('❌ Tu veux vraiment te gifler toi-même? 🤔');
      }

      // Vérifie si le mode secret est activé
      const isSecret = args.some(arg => arg.toLowerCase() === 'secret');

      // Messages amusants aléatoires
      const funMessages = [
        'a giflé',
        'a mis une tape à',
        'a calmé',
        'a recadré',
        'a corrigé',
        'a tapé'
      ];

      const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];

      // Récupère un GIF aléatoire depuis Giphy
      const giphyApiKey = process.env.GIPHY_API_KEY;
      const searchTerm = 'slap';
      const url = `https://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}&tag=${searchTerm}&rating=g`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.data || !data.data.images) {
        return message.reply('❌ Impossible de récupérer un GIF pour le moment.');
      }

      const gifUrl = data.data.images.original.url;

      // Supprime le message original
      try {
        await message.delete();
      } catch (err) {
        console.log('Impossible de supprimer le message:', err.message);
      }

      if (isSecret) {
        // Mode secret : envoie en DM
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setDescription(`👋 **Quelqu'un** t'a tapé en secret!`)
          .setImage(gifUrl)
          .setFooter({ text: '💌 Message secret • C\'est pour rire! 😄' });

        try {
          await mentionedUser.send({ embeds: [embed] });
          
          // Track le DM pour les réponses
          trackDM(mentionedUser.id, message.author.id);
          
          // Confirme l'envoi en DM à l'auteur avec le même GIF
          const confirmEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setDescription(`✅ Ta tape secrète a été envoyée à **${mentionedUser.username}**!`)
            .setImage(gifUrl)
            .setFooter({ text: 'Aperçu du GIF envoyé' });
          await message.author.send({ embeds: [confirmEmbed] });
        } catch (_err) {
          await message.channel.send(`❌ Impossible d'envoyer un message privé à ${mentionedUser}.`);
        }
      } else {
        // Mode public : envoie dans le canal avec mention
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setDescription(`👋 <@${message.author.id}> ${randomMessage} <@${mentionedUser.id}>!`)
          .setImage(gifUrl)
          .setFooter({ text: 'C\'est pour rire! 😄' });

        await message.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Erreur dans la commande slap:', error);
      message.reply('❌ Une erreur est survenue lors du traitement de ta commande.');
    }
  },
};

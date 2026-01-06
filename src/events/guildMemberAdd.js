/**
 * @file Guild Member Add Event
 * @description Événement guildMemberAdd pour accueillir un nouveau membre
 * @param {Client} client - Le client Discord
 * @version 1.0.0
 */

const { Events } = require('discord.js');
const { getRandomWelcomeMessage } = require('../commands/admin/welcome.js');
 
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        
        if (!welcomeChannelId) {
            console.error('WELCOME_CHANNEL_ID n\'est pas défini dans le fichier .env');
            return;
        }
        
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        
        if (!channel) {
            console.error(`Le canal avec l'ID ${welcomeChannelId} n'a pas été trouvé`);
            return;
        }
        
        const welcomeMessage = getRandomWelcomeMessage(member);
        
        try {
            await channel.send(welcomeMessage);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
        }
    },
};

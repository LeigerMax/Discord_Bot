/**
 * @file Guild Member Add Event
 * @description Accueille un nouveau membre avec un message aléatoire après vérification anti-raid
 * @module events/guildMemberAdd
 * @listens guildMemberAdd
 * @requires discord.js
 */

const { Events } = require('discord.js');
const { getRandomWelcomeMessage } = require('../commands/admin/welcome.js');
 
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Vérifie l'anti-raid en premier
        try {
            const antiRaidCommand = member.client.commands?.get('antiraid');
            if (antiRaidCommand && antiRaidCommand.checkRaid) {
                await antiRaidCommand.checkRaid(member.guild, member);
                
                // Si le serveur est verrouillé, on arrête ici (le membre a été kick/ban)
                const config = antiRaidCommand.getConfig(member.guild.id);
                if (config && config.locked) {
                    return; // Le membre a été retiré par l'anti-raid
                }
            }
        } catch (error) {
            console.error('Erreur anti-raid:', error);
        }

        // Message de bienvenue
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

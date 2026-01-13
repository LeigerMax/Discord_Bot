/**
 * @file Welcome Command
 * @description Gère le système de bienvenue avec messages aléatoires pour les nouveaux membres
 * @module commands/admin/welcome
 * @category Admin
 * @requires discord.js
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Gérer le système de bienvenue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Tester un message de bienvenue')
        ),
    
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'test') {
            const welcomeMessage = getRandomWelcomeMessage(interaction.user);
            await interaction.reply({ content: welcomeMessage, ephemeral: true });
        }
    },
};

/**
 * Fonction pour obtenir un message de bienvenue aléatoire
 * @param {*} member 
 * @returns 
 */
function getRandomWelcomeMessage(member) {
    const messages = [
        `Oh non... ${member} vient de débarquer. Qui a laissé la porte ouverte ? 🙄`,
        `Tiens, ${member} a trouvé le serveur. Quelqu'un peut lui expliquer qu'on est complets ? 😒`,
        `${member} vient d'arriver ! On fait semblant d'être contents ou... ? 🤔`,
        `Attention tout le monde, ${member} est là ! Cachez vos memes de qualité ! 😏`,
        `${member} a rejoint le serveur. RIP notre tranquillité. ⚰️`,
        `Bienvenue ${member} ! T'as pas mieux à faire de ta vie ? 😂`,
        `${member} vient de se connecter. Quelqu'un peut lui montrer la sortie ? 🚪`,
        `Oh super, ${member} est arrivé. Comme si on avait besoin de plus de chaos ici... 🤦`,
        `${member} a décidé de nous rejoindre. Courage à nous tous ! 💀`,
        `Toc toc, qui est là ? C'est ${member}. Malheureusement, on ne peut pas faire semblant de ne pas être là... 😅`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

exports.getRandomWelcomeMessage = getRandomWelcomeMessage;

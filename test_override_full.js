/**
 * Test du système complet override avec commandHandler
 */

const CommandHandler = require('./src/utils/commandHandler.js');
const path = require('node:path');

// Simule un client Discord minimaliste
const mockClient = {
  user: { tag: 'TestBot#0000' },
  guilds: { cache: { size: 1 } }
};

console.log('=== TEST COMMANDHANDLER ===\n');

// Initialise le commandHandler
const commandHandler = new CommandHandler(mockClient, '!');
mockClient.commandHandler = commandHandler;

// Charge les commandes
const commandsPath = path.join(__dirname, 'src', 'commands');
commandHandler.loadCommands(commandsPath);

console.log('\n=== VÉRIFICATION ACCÈS AUX MAPS ===\n');

// Récupère les commandes
const commands = mockClient.commandHandler.commands;
console.log('Nombre de commandes chargées:', commands.size);

const curseCommand = commands.get('curse');
const muteCommand = commands.get('mute');
const roulettemuteCommand = commands.get('roulettemute');
const overrideCommand = commands.get('override');

console.log('\nCommande curse chargée?', !!curseCommand);
console.log('curse.cursedPlayers accessible?', !!curseCommand?.cursedPlayers);
console.log('curse.cursedPlayers est une Map?', curseCommand?.cursedPlayers instanceof Map);

console.log('\nCommande mute chargée?', !!muteCommand);
console.log('mute.mutedMembers accessible?', !!muteCommand?.mutedMembers);
console.log('mute.mutedMembers est une Map?', muteCommand?.mutedMembers instanceof Map);

console.log('\nCommande roulettemute chargée?', !!roulettemuteCommand);
console.log('roulettemute.mutedMembers accessible?', !!roulettemuteCommand?.mutedMembers);
console.log('roulettemute.mutedMembers est une Map?', roulettemuteCommand?.mutedMembers instanceof Map);

console.log('\nCommande override chargée?', !!overrideCommand);

// Test d'ajout
console.log('\n=== TEST AJOUT ET LECTURE ===\n');

curseCommand.cursedPlayers.set('user1', { type: 'IGNORED', timeout: null });
muteCommand.mutedMembers.set('user2', { interval: null });
roulettemuteCommand.mutedMembers.set('user3', { interval: null });

console.log('cursedPlayers.size:', curseCommand.cursedPlayers.size);
console.log('mutedMembers (mute).size:', muteCommand.mutedMembers.size);
console.log('mutedMembers (roulettemute).size:', roulettemuteCommand.mutedMembers.size);

// Simule ce que fait override
console.log('\n=== SIMULATION OVERRIDE ===\n');

const cursedPlayers = curseCommand.cursedPlayers;
const mutedMembers = muteCommand.mutedMembers;
const rouletteMutedMembers = roulettemuteCommand.mutedMembers;

console.log('Override peut lire cursedPlayers.size:', cursedPlayers.size);
console.log('Override peut lire mutedMembers.size:', mutedMembers.size);
console.log('Override peut lire rouletteMutedMembers.size:', rouletteMutedMembers.size);

// Clear comme le ferait override
cursedPlayers.clear();
mutedMembers.clear();
rouletteMutedMembers.clear();

console.log('\nAprès clear:');
console.log('cursedPlayers.size:', curseCommand.cursedPlayers.size);
console.log('mutedMembers.size:', muteCommand.mutedMembers.size);
console.log('rouletteMutedMembers.size:', roulettemuteCommand.mutedMembers.size);

console.log('\n✅ Test terminé - Override devrait fonctionner correctement');

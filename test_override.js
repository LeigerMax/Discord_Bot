/**
 * Test manuel pour vérifier que les Maps sont bien accessibles
 */

// Simule le chargement des commandes
const curseCommand = require('./src/commands/fun/curse.js');
const muteCommand = require('./src/commands/admin/mute.js');
const roulettemuteCommand = require('./src/commands/fun/roulettemute.js');

console.log('=== TEST MAPS ACCESSIBLES ===\n');

console.log('curse.cursedPlayers:', curseCommand.cursedPlayers);
console.log('Type:', typeof curseCommand.cursedPlayers);
console.log('Est une Map?', curseCommand.cursedPlayers instanceof Map);
console.log('Taille:', curseCommand.cursedPlayers?.size);
console.log();

console.log('mute.mutedMembers:', muteCommand.mutedMembers);
console.log('Type:', typeof muteCommand.mutedMembers);
console.log('Est une Map?', muteCommand.mutedMembers instanceof Map);
console.log('Taille:', muteCommand.mutedMembers?.size);
console.log();

console.log('roulettemute.mutedMembers:', roulettemuteCommand.mutedMembers);
console.log('Type:', typeof roulettemuteCommand.mutedMembers);
console.log('Est une Map?', roulettemuteCommand.mutedMembers instanceof Map);
console.log('Taille:', roulettemuteCommand.mutedMembers?.size);
console.log();

// Test d'ajout
console.log('=== TEST AJOUT DANS LES MAPS ===\n');

curseCommand.cursedPlayers.set('test123', { type: 'IGNORED', timeout: null });
console.log('Après ajout dans cursedPlayers, taille:', curseCommand.cursedPlayers.size);

muteCommand.mutedMembers.set('test456', { interval: null });
console.log('Après ajout dans mutedMembers (mute), taille:', muteCommand.mutedMembers.size);

roulettemuteCommand.mutedMembers.set('test789', { interval: null });
console.log('Après ajout dans mutedMembers (roulettemute), taille:', roulettemuteCommand.mutedMembers.size);
console.log();

console.log('✅ Test terminé - Les Maps sont accessibles et modifiables');

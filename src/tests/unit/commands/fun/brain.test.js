/**
 * Tests unitaires pour la commande "brain".
 */

const brainCommand = require('../../../../commands/fun/brain');

describe('Brain Command', () => {

    let mockMessage;
    let mockUserMention;

    beforeEach(() => {
        mockUserMention = {
            id: '987654321',
            username: 'MentionedUser'
        };

        mockMessage = {
            author: { username: 'TestUser', id: '123456789'},
            reply: jest.fn().mockResolvedValue(undefined),
            mentions: {
                users: {
                    first: jest.fn(() => mockUserMention),
                    size: 1
                }
            }
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ========================================
    // TESTS STRUCTURELS
    // ========================================
    // Test 1
    test('devrait avoir les propriétés requises', () => {
        expect(brainCommand).toHaveProperty('name');
        expect(brainCommand).toHaveProperty('description');
        expect(brainCommand).toHaveProperty('usage');
        expect(brainCommand).toHaveProperty('execute');
        expect(brainCommand.name).toBe('brain');
        expect(typeof brainCommand.execute).toBe('function');
    });

    // ========================================
    // TESTS FONCTIONNELS
    // ========================================
    // Test 2
    test('devrait répondre avec l\'état du cerveau de l\'auteur si aucun utilisateur mentionné', async () => {
        // ARRANGE: Aucune mention + forcer Math.random pour obtenir un état spécifique
        mockMessage.mentions.users.first = jest.fn(() => null); // Pas de mention
        jest.spyOn(Math, 'random').mockReturnValue(0.1); // Devrait sélectionner le premier état (Brain: ON)
        const args = [];

        // ACT
        await brainCommand.execute(mockMessage, args);

        // ASSERT: Vérifier que reply a été appelé
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);

        // ASSERT : Récupérer l'argument passé à reply
        const replyArg = mockMessage.reply.mock.calls[0][0];
        expect(replyArg.embeds).toBeDefined();
        const embed = replyArg.embeds[0];

        // ASSERT : Vérifier le contenu de l'embed
        expect(embed.data.title).toBe('🧠 État du Cerveau');
        expect(embed.data.description).toContain('TestUser');
        expect(embed.data.description).toContain('Brain: ON');
        expect(embed.data.description).toContain('Plays smart, pense avant d\'agir');
        });

    // Test 3
    test('devrait répondre avec l\'état du cerveau de l\'utilisateur mentionné', async () => {
        // ARRANGE: Forcer Math.random pour obtenir un état spécifique
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // Devrait sélectionner un état spécifique (Brain: OVERLOAD)
        const args = [ `<@${mockUserMention.id}>` ];

        // ACT
        await brainCommand.execute(mockMessage, args);

        // ASSERT: Vérifier que reply a été appelé
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);

        // ASSERT : Récupérer l'argument passé à reply
        const replyArg = mockMessage.reply.mock.calls[0][0];
        expect(replyArg.embeds).toBeDefined();
        const embed = replyArg.embeds[0];

        // ASSERT : Vérifier le contenu de l'embed
        expect(embed.data.title).toBe('🧠 État du Cerveau');
        expect(embed.data.description).toContain('MentionedUser');
        expect(embed.data.description).toContain('Brain: OVERLOAD');
        expect(embed.data.description).toContain('200 IQ plays incoming');
    });

    // Test 4
    test('devrait gérer les erreurs et répondre avec un message d\'erreur', async () => {
        // ARRANGE: Espionner console.error AVANT tout
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Recréer complètement le mockMessage pour ce test
        const testMessage = {
            author: { username: 'TestUser', id: '123456789'},
            mentions: {
                users: {
                    first: jest.fn(() => null)
                }
            },
            reply: jest.fn()
                .mockRejectedValueOnce(new Error('Simulated failure')) // Premier appel échoue
                .mockResolvedValueOnce(undefined) // Second appel réussit
        };
        
        const args = [];

        // ACT
        await brainCommand.execute(testMessage, args);

        // ASSERT: Vérifier que l'erreur a été loggée
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erreur dans la commande brain:',
            expect.any(Error)
        );

        // ASSERT: Vérifier que reply a été appelé deux fois
        expect(testMessage.reply).toHaveBeenCalledTimes(2);

        // ASSERT: Vérifier que le second appel est le message d'erreur
        expect(testMessage.reply.mock.calls[1][0]).toBe('❌ Une erreur est survenue lors du traitement de ta commande.');
        
        // Nettoyer le spy console.error
        consoleErrorSpy.mockRestore();
    });

});
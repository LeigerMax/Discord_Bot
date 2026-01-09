/**
 * Tests unitaires pour la commande "dice".
 */

const diceCommand = require('../../../../commands/fun/dice');

describe('Dice Command', () => {

    let mockMessage;
    let randomSpy;
  
    beforeEach(() => {
        mockMessage = {
            author: { username: 'TestUser', id: '123456789'},
            reply: jest.fn().mockResolvedValue(undefined)
        };
        
        // Espionner Math.random
        randomSpy = jest.spyOn(Math, 'random');
    });
  
    afterEach(() => {
        if (randomSpy) {
            randomSpy.mockRestore();
        }
        jest.clearAllMocks();
    });

    
    // ========================================
    // TESTS STRUCTURELS
    // ========================================
    // Test 1
    test('devrait avoir les propriétés requises', () => {
        expect(diceCommand).toHaveProperty('name');
        expect(diceCommand).toHaveProperty('description');
        expect(diceCommand).toHaveProperty('usage');
        expect(diceCommand).toHaveProperty('execute');
        expect(diceCommand.name).toBe('dice');
        expect(typeof diceCommand.execute).toBe('function');
    });

    // ========================================
    // TESTS FONCTIONNELS 
    // ========================================
    // Test 2-7
    test.each([
        [0.0, 1, '⚀'],      // random=0.0 → 1
        [0.16, 1, '⚀'],     // random=0.16 → 1
        [0.17, 2, '⚁'],     // random=0.17 → 2
        [0.5, 4, '⚃'],      // random=0.5 → 4
        [0.83, 5, '⚄'],     // random=0.83 → 5
        [0.99, 6, '⚅']      // random=0.99 → 6
    ])(
        'devrait retourner %i avec emoji %s quand Math.random() = %f',
        async (randomValue, expectedNumber, expectedEmoji) => {
        // ARRANGE: Configurer Math.random pour retourner une valeur spécifique
        randomSpy.mockReturnValue(randomValue);

        // ACT: Exécuter la commande
        await diceCommand.execute(mockMessage, []);

        // ASSERT: Vérifier que reply a été appelé
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);

        // ASSERT: Récupérer l'embed envoyé
        const replyCall = mockMessage.reply.mock.calls[0][0];
        const embed = replyCall.embeds[0];

        // ASSERT: Vérifier le contenu de l'embed
        expect(embed.data.title).toBe('🎲 Lancer de Dé');
        expect(embed.data.description).toContain(expectedEmoji);
        expect(embed.data.description).toContain(`**${expectedNumber}**`);
        expect(embed.data.footer.text).toBe('Lancé par TestUser');
        expect(embed.data.timestamp).toBeDefined();
        }
    );

    // Test 8
    test('devrait gérer les erreurs', async () => {
        // ARRANGE: Faire échouer le premier appel, réussir le second (message d'erreur)
        mockMessage.reply.mockReset();
        mockMessage.reply
            .mockRejectedValueOnce(new Error('Discord API Error'))  // 1er appel échoue
            .mockResolvedValueOnce(undefined);                       // 2e appel réussit

        // Espionner console.error pour vérifier qu'il est appelé
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // ACT: Exécuter la commande
        await diceCommand.execute(mockMessage, []);

        // ASSERT: Vérifier que l'erreur a été loggée
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erreur dans la commande dice:',
            expect.any(Error)
        );

        // ASSERT: Vérifier que reply a été appelé 2 fois (échec + message d'erreur)
        expect(mockMessage.reply).toHaveBeenCalledTimes(2);
        
        // ASSERT: Vérifier que le message d'erreur contient le bon texte
        expect(mockMessage.reply).toHaveBeenLastCalledWith(
            '❌ Une erreur est survenue lors du traitement de ta commande.'
        );

        // Nettoyer le spy console.error
        consoleErrorSpy.mockRestore();
    });
});
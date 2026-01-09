/**
 * Tests unitaires pour la commande coach
 */

const coachCommand = require('../../../../commands/fun/coach');

describe('Coach Command', () => {

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
        expect(coachCommand).toHaveProperty('name');
        expect(coachCommand).toHaveProperty('description');
        expect(coachCommand).toHaveProperty('usage');
        expect(coachCommand).toHaveProperty('execute');
        expect(coachCommand.name).toBe('coach');
        expect(typeof coachCommand.execute).toBe('function');
    });

    // ========================================
    // TESTS FONCTIONNELS
    // ========================================
    // Test 2
    test('devrait retourner un conseil de type Sérieux avec la couleur verte', async () => {
        // ARRANGE: Forcer le premier conseil (index 0) - "Regarde la minimap toutes les 3 secondes"
        randomSpy.mockReturnValue(0.0);

        // ACT
        await coachCommand.execute(mockMessage, []);

        // ASSERT: Vérifier que reply a été appelé
        expect(mockMessage.reply).toHaveBeenCalledTimes(1);

        // Récupérer l'embed
        const replyArg = mockMessage.reply.mock.calls[0][0];
        expect(replyArg.embeds).toBeDefined();
        const embed = replyArg.embeds[0];

        // Vérifier le contenu
        expect(embed.data.title).toBe('🎓 Conseil du Coach');
        expect(embed.data.description).toContain('Regarde la minimap toutes les 3 secondes');
        expect(embed.data.description).toContain('Sérieux');
        expect(embed.data.description).toContain('🗺️');
        expect(embed.data.color).toBe(0x00FF00); // Vert
        expect(embed.data.footer.text).toContain('TestUser');
        expect(embed.data.footer.text).toContain('Coach AI');
        expect(embed.data.timestamp).toBeDefined();
    });

    // Test 3
    test('devrait retourner un conseil de type Troll avec la couleur rouge', async () => {
        // ARRANGE: Forcer le conseil index 10 - "Blame le support"
        randomSpy.mockReturnValue(0.42); // 0.42 * 24 = 10.08 → index 10

        // ACT
        await coachCommand.execute(mockMessage, []);

        // ASSERT
        const replyArg = mockMessage.reply.mock.calls[0][0];
        const embed = replyArg.embeds[0];

        expect(embed.data.description).toContain('Blame le support');
        expect(embed.data.description).toContain('Troll');
        expect(embed.data.description).toContain('😈');
        expect(embed.data.color).toBe(0xFF0000); // Rouge
    });

    // Test 4
    test('devrait retourner un conseil de type Mental avec la couleur bleue', async () => {
        // ARRANGE: Forcer le conseil index 21 - "Respire profondément avant de jouer"
        randomSpy.mockReturnValue(0.875); // 0.875 * 24 = 21

        // ACT
        await coachCommand.execute(mockMessage, []);

        // ASSERT
        const replyArg = mockMessage.reply.mock.calls[0][0];
        const embed = replyArg.embeds[0];

        expect(embed.data.description).toContain('Respire profondément avant de jouer');
        expect(embed.data.description).toContain('Mental');
        expect(embed.data.description).toContain('🧘');
        expect(embed.data.color).toBe(0x00BFFF); // Bleu clair
    });

    // Test 5
    test('devrait retourner un conseil de type Réaliste avec la couleur grise', async () => {
        // ARRANGE: Forcer le dernier conseil (index 23) - "Éteins ton PC, sors dehors"
        randomSpy.mockReturnValue(0.99); // 0.99 * 24 = 23.76 → index 23

        // ACT
        await coachCommand.execute(mockMessage, []);

        // ASSERT
        const replyArg = mockMessage.reply.mock.calls[0][0];
        const embed = replyArg.embeds[0];

        expect(embed.data.description).toContain('Éteins ton PC, sors dehors');
        expect(embed.data.description).toContain('Réaliste');
        expect(embed.data.description).toContain('🌳');
        expect(embed.data.color).toBe(0x808080); // Gris
    });


    // ========================================
    // TESTS DE GESTION D'ERREUR
    // ========================================
    // Test 6
    test('devrait gérer les erreurs gracieusement', async () => {
        // ARRANGE: Espionner console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Créer un mock qui échoue puis réussit
        const testMessage = {
            author: { username: 'TestUser', id: '123456789'},
            reply: jest.fn()
                .mockRejectedValueOnce(new Error('Discord API Error'))
                .mockResolvedValueOnce(undefined)
        };

        // ACT
        await coachCommand.execute(testMessage, []);

        // ASSERT: Vérifier que l'erreur a été loggée
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Erreur dans la commande coach:',
            expect.any(Error)
        );

        // Vérifier que reply a été appelé 2 fois
        expect(testMessage.reply).toHaveBeenCalledTimes(2);
        
        // Vérifier le message d'erreur
        expect(testMessage.reply.mock.calls[1][0]).toBe('❌ Une erreur est survenue lors du traitement de ta commande.');
        
        // Nettoyer
        consoleErrorSpy.mockRestore();
    });

});

/**
 * Tests unitaires pour la commande welcome (admin)
 */

const welcomeCommand = require('../../../../commands/admin/welcome');

describe('Welcome Command', () => {
  let mockInteraction;

  beforeEach(() => {
    mockInteraction = {
      user: { username: 'TestUser', toString: () => '<@123456789>' },
      options: {
        getSubcommand: jest.fn(() => 'test'),
      },
      reply: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait avoir les propriétés requises', () => {
    expect(welcomeCommand).toHaveProperty('data');
    expect(welcomeCommand).toHaveProperty('execute');
  });

  test('devrait avoir un SlashCommandBuilder configuré', () => {
    expect(welcomeCommand.data.name).toBe('welcome');
    expect(welcomeCommand.data.description).toBeDefined();
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test('devrait exécuter le subcommand "test"', async () => {
    await welcomeCommand.execute(mockInteraction);

    expect(mockInteraction.options.getSubcommand).toHaveBeenCalled();
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.any(String),
        ephemeral: true,
      })
    );
  });

  test('devrait retourner un message contenant le nom d\'utilisateur', async () => {
    await welcomeCommand.execute(mockInteraction);

    const replyCall = mockInteraction.reply.mock.calls[0][0];
    expect(replyCall.content).toContain('<@123456789>');
  });

  // ========================================
  // TESTS DE LA FONCTION getRandomWelcomeMessage
  // ========================================

  test.todo('getRandomWelcomeMessage devrait retourner un message');
  test.todo('getRandomWelcomeMessage devrait contenir la mention du membre');
  test.todo('getRandomWelcomeMessage devrait retourner différents messages');

  // ========================================
  // TESTS DE GESTION D'ERREUR
  // ========================================

  test('devrait gérer les erreurs lors de l\'exécution', async () => {
    mockInteraction.reply = jest.fn().mockRejectedValue(new Error('Interaction failed'));

    await expect(welcomeCommand.execute(mockInteraction)).rejects.toThrow();
  });
});

/**
 * Tests unitaires complets pour la commande spam
 */

const spamCommand = require('../../../../commands/fun/spam');

describe('Spam Command - Tests complets', () => {
  let mockMessage;
  let mockMentionedUser;

  beforeEach(() => {
    mockMentionedUser = {
      id: '987654321',
      username: 'TargetUser',
      send: jest.fn().mockResolvedValue(undefined),
    };

    mockMessage = {
      author: {
        id: '123456789',
        username: 'AuthorUser',
      },
      channel: {
        send: jest.fn().mockImplementation(() => 
          Promise.resolve({ delete: jest.fn().mockResolvedValue(undefined) })
        ),
        bulkDelete: jest.fn().mockResolvedValue(undefined),
      },
      mentions: {
        users: {
          first: jest.fn(() => mockMentionedUser),
        },
      },
      delete: jest.fn().mockResolvedValue(undefined),
      reply: jest.fn().mockResolvedValue(undefined),
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait avoir les propriétés requises', () => {
    expect(spamCommand).toHaveProperty('name');
    expect(spamCommand).toHaveProperty('description');
    expect(spamCommand).toHaveProperty('usage');
    expect(spamCommand).toHaveProperty('execute');
    expect(spamCommand.name).toBe('spam');
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  test('devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first = jest.fn(() => null);

    await spamCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('mentionner un utilisateur'),
      })
    );
  });

  test('devrait refuser si durée inférieure à 5 secondes', async () => {
    await spamCommand.execute(mockMessage, ['@user', '3']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('minimum est de 5 secondes')
    );
  });

  test('devrait refuser si durée supérieure à 300 secondes', async () => {
    await spamCommand.execute(mockMessage, ['@user', '301']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('maximum est de 300 secondes')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test('devrait démarrer le spam avec durée par défaut', async () => {
    await spamCommand.execute(mockMessage, ['@user']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );
  });

  test('devrait accepter une durée personnalisée', async () => {
    await spamCommand.execute(mockMessage, ['@user', '30']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              description: expect.stringContaining('30 secondes'),
            }),
          }),
        ]),
      })
    );
  });

  test('devrait permettre auto-spam', async () => {
    mockMentionedUser.id = mockMessage.author.id;

    await spamCommand.execute(mockMessage, ['@self', '10']);

    expect(mockMessage.reply).toHaveBeenCalled();
  });

  test('devrait envoyer des messages de spam', async () => {
    await spamCommand.execute(mockMessage, ['@user', '5']);

    // Attend le délai initial (1 seconde)
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    // Attend quelques itérations de spam (2 secondes chacune)
    await jest.advanceTimersByTimeAsync(4000);
    await Promise.resolve();

    expect(mockMessage.channel.send).toHaveBeenCalled();
  });
});

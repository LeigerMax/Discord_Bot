/**
 * Tests unitaires complets pour la commande hug
 */

const hugCommand = require('../../../../commands/fun/hug');

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');

// Mock du module dmReply
jest.mock('../../../../events/dmReply', () => ({
  trackDM: jest.fn(),
}));

describe('Hug Command - Tests complets', () => {
  let mockMessage;
  let mockMentionedUser;

  beforeEach(() => {
    mockMentionedUser = {
      id: '987654321',
      username: 'TargetUser',
    };

    mockMessage = {
      author: {
        id: '123456789',
        username: 'AuthorUser',
      },
      channel: {
        send: jest.fn().mockResolvedValue({ delete: jest.fn() }),
      },
      mentions: {
        users: {
          first: jest.fn(() => mockMentionedUser),
        },
      },
      delete: jest.fn().mockResolvedValue(undefined),
      reply: jest.fn().mockResolvedValue(undefined),
    };

    // Mock de l'API Giphy
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          images: {
            original: {
              url: 'https://media.giphy.com/media/test/giphy.gif',
            },
          },
        },
      }),
    });

    process.env.GIPHY_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait avoir les propriétés requises', () => {
    expect(hugCommand).toHaveProperty('name');
    expect(hugCommand).toHaveProperty('description');
    expect(hugCommand).toHaveProperty('usage');
    expect(hugCommand).toHaveProperty('execute');
    expect(hugCommand.name).toBe('hug');
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  test('devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first = jest.fn(() => null);

    await hugCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('mentionner un utilisateur'),
      })
    );
  });

  test('devrait refuser si auto-mention', async () => {
    mockMentionedUser.id = mockMessage.author.id;

    await hugCommand.execute(mockMessage, ['@self']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('ne peux pas te faire un câlin toi-même')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test('devrait envoyer un GIF avec succès', async () => {
    await hugCommand.execute(mockMessage, ['@user']);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.giphy.com')
    );
    expect(mockMessage.delete).toHaveBeenCalled();
    expect(mockMessage.channel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );
  });

  test('devrait détecter le mode secret', async () => {
    mockMentionedUser.send = jest.fn().mockResolvedValue(undefined);
    
    await hugCommand.execute(mockMessage, ['@user', 'secret']);

    expect(mockMentionedUser.send).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              description: expect.stringContaining('secret'),
            }),
          }),
        ]),
      })
    );
  });

  test('devrait gérer une erreur API Giphy', async () => {
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ data: null }),
    });

    await hugCommand.execute(mockMessage, ['@user']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Impossible de récupérer un GIF')
    );
  });
});

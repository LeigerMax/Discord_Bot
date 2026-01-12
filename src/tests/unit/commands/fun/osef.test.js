/**
 * Tests unitaires complets pour la commande osef
 */

const osefCommand = require('../../../../commands/fun/osef');

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');

// Mock du module dmReply
jest.mock('../../../../events/dmReply', () => ({
  trackDM: jest.fn(),
}));

describe('Osef Command - Tests complets', () => {
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

  test('devrait avoir les propriétés requises', () => {
    expect(osefCommand).toHaveProperty('name');
    expect(osefCommand).toHaveProperty('description');
    expect(osefCommand).toHaveProperty('execute');
    expect(osefCommand.name).toBe('osef');
  });

  test('devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first = jest.fn(() => null);

    await osefCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('mentionner un utilisateur'),
      })
    );
  });

  test('devrait refuser si auto-mention', async () => {
    mockMentionedUser.id = mockMessage.author.id;

    await osefCommand.execute(mockMessage, ['@self']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu ne peux pas te dire "osef" à toi-même')
    );
  });

  test('devrait envoyer un GIF avec succès', async () => {
    await osefCommand.execute(mockMessage, ['@user']);

    expect(fetch).toHaveBeenCalled();
    expect(mockMessage.delete).toHaveBeenCalled();
    expect(mockMessage.channel.send).toHaveBeenCalled();
  });

  test('devrait détecter le mode secret', async () => {
    mockMentionedUser.send = jest.fn().mockResolvedValue(undefined);
    
    await osefCommand.execute(mockMessage, ['@user', 'secret']);

    expect(mockMentionedUser.send).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );
  });
});

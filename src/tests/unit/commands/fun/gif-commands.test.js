/**
 * Tests unitaires pour les commandes GIF
 * Pattern réutilisable pour hug, kiss, slap, osef
 * 
 * Note: Ces commandes utilisent l'API Giphy et nécessitent GIPHY_API_KEY
 * Les tests vérifient uniquement la logique métier, pas les appels API
 */

const hugCommand = require('../../../../commands/fun/hug');
const kissCommand = require('../../../../commands/fun/kiss');
const slapCommand = require('../../../../commands/fun/slap');
const osefCommand = require('../../../../commands/fun/osef');

// Mock node-fetch
jest.mock('node-fetch');
const fetch = require('node-fetch');

describe('GIF Commands - Tests basiques', () => {
  let mockMessage;

  beforeEach(() => {
    // Mock de la réponse Giphy
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          images: {
            original: {
              url: 'https://media.giphy.com/media/test123/giphy.gif'
            }
          }
        }
      })
    });

    mockMessage = {
      author: { id: '123', username: 'TestUser' },
      mentions: { 
        users: {
          first: jest.fn().mockReturnValue(null),
          size: 0
        }
      },
      reply: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      channel: {
        id: '456',
        send: jest.fn().mockResolvedValue(undefined)
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS HUG
  // ========================================
  
  test('hug - devrait refuser si aucune mention', async () => {
    await hugCommand.execute(mockMessage, []);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Tu dois mentionner un utilisateur')
      })
    );
  });

  test('hug - devrait refuser si auto-mention', async () => {
    const mentionedUser = { id: '123', username: 'TestUser' };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    
    await hugCommand.execute(mockMessage, ['<@123>']);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu ne peux pas te faire un câlin toi-même')
    );
  });

  test('hug - devrait détecter le mode secret', async () => {
    const mentionedUser = { 
      id: '789', 
      username: 'OtherUser',
      send: jest.fn().mockResolvedValue(undefined)
    };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    mockMessage.author.send = jest.fn().mockResolvedValue(undefined);
    
    await hugCommand.execute(mockMessage, ['<@789>', 'secret']);
    
    expect(mentionedUser.send).toHaveBeenCalled();
    expect(mockMessage.author.send).toHaveBeenCalled();
  });

  // ========================================
  // TESTS KISS
  // ========================================
  
  test('kiss - devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first.mockReturnValue(null);
    
    await kissCommand.execute(mockMessage, []);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Tu dois mentionner un utilisateur')
      })
    );
  });

  test('kiss - devrait refuser si auto-mention', async () => {
    const mentionedUser = { id: '123', username: 'TestUser' };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    
    await kissCommand.execute(mockMessage, ['<@123>']);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu ne peux pas t\'embrasser toi-même')
    );
  });

  test('kiss - devrait détecter le mode secret', async () => {
    const mentionedUser = { 
      id: '789', 
      username: 'OtherUser',
      send: jest.fn().mockResolvedValue(undefined)
    };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    mockMessage.author.send = jest.fn().mockResolvedValue(undefined);
    
    await kissCommand.execute(mockMessage, ['<@789>', 'secret']);
    
    expect(mentionedUser.send).toHaveBeenCalled();
    expect(mockMessage.author.send).toHaveBeenCalled();
  });

  // ========================================
  // TESTS SLAP
  // ========================================
  
  test('slap - devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first.mockReturnValue(null);
    
    await slapCommand.execute(mockMessage, []);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Tu dois mentionner un utilisateur')
      })
    );
  });

  test('slap - devrait refuser si auto-mention', async () => {
    const mentionedUser = { id: '123', username: 'TestUser' };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    
    await slapCommand.execute(mockMessage, ['<@123>']);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu veux vraiment te gifler toi-même')
    );
  });

  test('slap - devrait détecter le mode secret', async () => {
    const mentionedUser = { 
      id: '789', 
      username: 'OtherUser',
      send: jest.fn().mockResolvedValue(undefined)
    };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    mockMessage.author.send = jest.fn().mockResolvedValue(undefined);
    
    await slapCommand.execute(mockMessage, ['<@789>', 'secret']);
    
    expect(mentionedUser.send).toHaveBeenCalled();
    expect(mockMessage.author.send).toHaveBeenCalled();
  });

  // ========================================
  // TESTS OSEF
  // ========================================
  
  test('osef - devrait refuser si aucune mention', async () => {
    mockMessage.mentions.users.first.mockReturnValue(null);
    
    await osefCommand.execute(mockMessage, []);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Tu dois mentionner un utilisateur')
      })
    );
  });

  test('osef - devrait refuser si auto-mention', async () => {
    const mentionedUser = { id: '123', username: 'TestUser' };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    
    await osefCommand.execute(mockMessage, ['<@123>']);
    
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu ne peux pas te dire "osef" à toi-même')
    );
  });

  test('osef - devrait détecter le mode secret', async () => {
    const mentionedUser = { 
      id: '789', 
      username: 'OtherUser',
      send: jest.fn().mockResolvedValue(undefined)
    };
    mockMessage.mentions.users.first.mockReturnValue(mentionedUser);
    mockMessage.author.send = jest.fn().mockResolvedValue(undefined);
    
    await osefCommand.execute(mockMessage, ['<@789>', 'secret']);
    
    expect(mentionedUser.send).toHaveBeenCalled();
    expect(mockMessage.author.send).toHaveBeenCalled();
  });
});

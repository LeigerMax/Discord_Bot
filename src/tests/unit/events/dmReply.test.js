/**
 * Tests unitaires pour l'événement dmReply
 * Teste le système de réponse aux messages privés
 */

describe('Event: dmReply', () => {
  let mockClient;
  let mockMessage;
  let mockOriginalSender;
  let mockAuthor;
  let messageCreateHandler;
  let dmReplyModule;

  beforeEach(() => {
    jest.resetModules();
    
    mockAuthor = {
      id: 'author-123',
      username: 'TestUser',
      tag: 'TestUser#1234',
      bot: false,
      displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
    };

    mockOriginalSender = {
      id: 'original-456',
      username: 'OriginalUser',
      send: jest.fn().mockResolvedValue({})
    };

    mockMessage = {
      author: mockAuthor,
      content: 'Ceci est une réponse',
      channel: {
        type: 1 // DM
      },
      attachments: new Map(),
      reply: jest.fn().mockResolvedValue({})
    };

    mockClient = {
      on: jest.fn((event, handler) => {
        if (event === 'messageCreate') {
          messageCreateHandler = handler;
        }
      }),
      users: {
        fetch: jest.fn().mockResolvedValue(mockOriginalSender)
      }
    };

    // Import du module
    dmReplyModule = require('../../../events/dmReply.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure du module', () => {
    test('doit exporter les fonctions nécessaires', () => {
      expect(typeof dmReplyModule.trackDM).toBe('function');
      expect(typeof dmReplyModule.getOriginalSender).toBe('function');
      expect(typeof dmReplyModule.init).toBe('function');
    });

    test('doit enregistrer un listener sur messageCreate', () => {
      dmReplyModule.init(mockClient);
      expect(mockClient.on).toHaveBeenCalledWith('messageCreate', expect.any(Function));
    });
  });

  describe('Fonction trackDM', () => {
    test('doit ajouter un tracking', () => {
      dmReplyModule.trackDM('recipient-1', 'sender-1');
      const result = dmReplyModule.getOriginalSender('recipient-1');
      expect(result).toBe('sender-1');
    });

    test('doit permettre plusieurs trackings', () => {
      dmReplyModule.trackDM('recipient-1', 'sender-1');
      dmReplyModule.trackDM('recipient-2', 'sender-2');
      
      expect(dmReplyModule.getOriginalSender('recipient-1')).toBe('sender-1');
      expect(dmReplyModule.getOriginalSender('recipient-2')).toBe('sender-2');
    });
  });

  describe('Fonction getOriginalSender', () => {
    test('doit retourner undefined si pas de tracking', () => {
      const result = dmReplyModule.getOriginalSender('unknown-user');
      expect(result).toBeUndefined();
    });

    test('doit retourner le sender si tracking existe', () => {
      dmReplyModule.trackDM('recipient-1', 'sender-1');
      expect(dmReplyModule.getOriginalSender('recipient-1')).toBe('sender-1');
    });
  });

  describe('Traitement des messages', () => {
    beforeEach(() => {
      dmReplyModule.init(mockClient);
    });

    test('doit ignorer les messages de bots', async () => {
      mockMessage.author.bot = true;
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      expect(mockClient.users.fetch).not.toHaveBeenCalled();
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('doit ignorer les messages non-DM', async () => {
      mockMessage.channel.type = 0; // Guild text channel
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      expect(mockClient.users.fetch).not.toHaveBeenCalled();
    });

    test('doit ignorer si pas de tracking', async () => {
      await messageCreateHandler(mockMessage);

      expect(mockClient.users.fetch).not.toHaveBeenCalled();
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('doit transférer le message si tracking existe', async () => {
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      expect(mockClient.users.fetch).toHaveBeenCalledWith('original-456');
      expect(mockOriginalSender.send).toHaveBeenCalled();
      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('doit inclure le contenu du message dans l\'embed', async () => {
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      const sendCall = mockOriginalSender.send.mock.calls[0][0];
      expect(sendCall).toHaveProperty('embeds');
      expect(sendCall.embeds[0].data.description).toContain('Ceci est une réponse');
    });

    test('doit inclure l\'auteur dans l\'embed', async () => {
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      const sendCall = mockOriginalSender.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.description).toContain('TestUser');
    });

    test('doit gérer les pièces jointes', async () => {
      const mockAttachment = { url: 'https://example.com/image.png' };
      mockMessage.attachments = new Map([['1', mockAttachment]]);
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      expect(mockOriginalSender.send).toHaveBeenCalled();
      const sendCall = mockOriginalSender.send.mock.calls[0][0];
      const embed = sendCall.embeds[0];
      
      // Vérifie que les pièces jointes sont incluses
      const hasAttachmentField = embed.data.fields?.some(f => f.name.includes('Pièces jointes'));
      expect(hasAttachmentField).toBe(true);
    });

    test('doit envoyer une confirmation à l\'auteur', async () => {
      dmReplyModule.trackDM('author-123', 'original-456');

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalled();
      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall).toHaveProperty('embeds');
      expect(replyCall.embeds[0].data.description).toContain('transféré');
    });

    test('doit gérer les erreurs de fetch user', async () => {
      mockClient.users.fetch.mockRejectedValue(new Error('User not found'));
      dmReplyModule.trackDM('author-123', 'original-456');

      // Ne doit pas crash
      await expect(messageCreateHandler(mockMessage)).resolves.not.toThrow();
      
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('doit gérer les erreurs d\'envoi', async () => {
      mockOriginalSender.send.mockRejectedValue(new Error('Cannot send'));
      dmReplyModule.trackDM('author-123', 'original-456');

      // Ne doit pas crash
      await expect(messageCreateHandler(mockMessage)).resolves.not.toThrow();
    });
  });
});

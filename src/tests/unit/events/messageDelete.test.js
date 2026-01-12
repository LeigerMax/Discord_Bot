/**
 * Tests unitaires pour l'event messageDelete
 */

describe('MessageDelete Event', () => {
  let mockClient;
  let messageDeleteEvent;
  let mockMessage;

  beforeEach(() => {
    // Clear le module du cache pour avoir un état propre
    jest.resetModules();
    
    mockClient = {
      eventHandlers: new Map(),
      on: jest.fn(),
    };

    // Charge l'event
    messageDeleteEvent = require('../../../events/messageDelete');
    
    // Initialise l'event avec le client mock
    messageDeleteEvent(mockClient);

    // Mock d'un message
    mockMessage = {
      id: 'msg123',
      author: {
        id: 'user123',
        username: 'TestUser',
        displayName: 'Test User Display',
        displayAvatarURL: jest.fn(() => 'https://example.com/avatar.png'),
        bot: false,
      },
      content: 'Ceci est un message de test',
      attachments: new Map(),
      channel: {
        id: 'ch123',
        name: 'general',
      },
      guild: {
        id: 'guild123',
        name: 'Test Guild',
        channels: {
          cache: new Map(),
        },
      },
      createdAt: new Date(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS D'INITIALISATION
  // ========================================

  describe('Initialisation de l\'event', () => {
    test('devrait enregistrer l\'event messageDelete', () => {
      expect(mockClient.on).toHaveBeenCalledWith('messageDelete', expect.any(Function));
    });

    test('devrait créer eventHandlers sur le client', () => {
      expect(mockClient.eventHandlers).toBeDefined();
      expect(mockClient.eventHandlers.has('messageDelete')).toBe(true);
    });

    test('devrait exposer getDeletedMessages', () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      expect(handler.getDeletedMessages).toBeDefined();
      expect(typeof handler.getDeletedMessages).toBe('function');
    });

    test('devrait exposer clearHistory', () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      expect(handler.clearHistory).toBeDefined();
      expect(typeof handler.clearHistory).toBe('function');
    });
  });

  // ========================================
  // TESTS DE STOCKAGE DES MESSAGES
  // ========================================

  describe('Stockage des messages supprimés', () => {
    test('devrait stocker un message supprimé', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      await eventCallback(mockMessage);

      const deletedMessages = handler.getDeletedMessages(10);
      expect(deletedMessages).toHaveLength(1);
      expect(deletedMessages[0].id).toBe('msg123');
      expect(deletedMessages[0].content).toBe('Ceci est un message de test');
      expect(deletedMessages[0].author.username).toBe('TestUser');
    });

    test('devrait stocker plusieurs messages supprimés', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      // Supprime 3 messages
      for (let i = 0; i < 3; i++) {
        const msg = {
          ...mockMessage,
          id: `msg${i}`,
          content: `Message ${i}`,
        };
        await eventCallback(msg);
      }

      const deletedMessages = handler.getDeletedMessages(10);
      expect(deletedMessages).toHaveLength(3);
      expect(deletedMessages[0].content).toBe('Message 2'); // Plus récent en premier
      expect(deletedMessages[2].content).toBe('Message 0'); // Plus ancien en dernier
    });

    test('devrait limiter le stockage à 100 messages', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      // Supprime 150 messages
      for (let i = 0; i < 150; i++) {
        const msg = {
          ...mockMessage,
          id: `msg${i}`,
          content: `Message ${i}`,
        };
        await eventCallback(msg);
      }

      const deletedMessages = handler.getDeletedMessages(200);
      expect(deletedMessages).toHaveLength(100);
      expect(deletedMessages[0].content).toBe('Message 149'); // Plus récent
      expect(deletedMessages[99].content).toBe('Message 50'); // 100ème message
    });

    test('devrait stocker les informations de pièces jointes', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      mockMessage.attachments = new Map([
        ['att1', { name: 'image.png', url: 'https://example.com/image.png', size: 1024 }],
        ['att2', { name: 'doc.pdf', url: 'https://example.com/doc.pdf', size: 2048 }],
      ]);

      await eventCallback(mockMessage);

      const deletedMessages = handler.getDeletedMessages(1);
      expect(deletedMessages[0].attachments).toHaveLength(2);
      expect(deletedMessages[0].attachments[0].name).toBe('image.png');
      expect(deletedMessages[0].attachments[1].name).toBe('doc.pdf');
    });
  });

  // ========================================
  // TESTS DE FILTRAGE
  // ========================================

  describe('Filtrage des messages', () => {
    test('devrait ignorer les messages des bots', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      const botMessage = {
        ...mockMessage,
        author: { ...mockMessage.author, bot: true },
      };

      await eventCallback(botMessage);

      const deletedMessages = handler.getDeletedMessages(10);
      expect(deletedMessages).toHaveLength(0);
    });

    test('devrait ignorer les messages sans contenu ni pièces jointes', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      const emptyMessage = {
        ...mockMessage,
        content: '',
        attachments: new Map(),
      };

      await eventCallback(emptyMessage);

      const deletedMessages = handler.getDeletedMessages(10);
      expect(deletedMessages).toHaveLength(0);
    });

    test('devrait stocker les messages avec pièces jointes mais sans texte', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      const imageMessage = {
        ...mockMessage,
        content: '',
        attachments: new Map([
          ['att1', { name: 'image.png', url: 'https://example.com/image.png', size: 1024 }],
        ]),
      };

      await eventCallback(imageMessage);

      const deletedMessages = handler.getDeletedMessages(1);
      expect(deletedMessages).toHaveLength(1);
      expect(deletedMessages[0].content).toBe('[Aucun contenu texte]');
    });
  });

  // ========================================
  // TESTS DE RÉCUPÉRATION
  // ========================================

  describe('Récupération des messages (getDeletedMessages)', () => {
    beforeEach(async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      // Stocke plusieurs messages de différents utilisateurs
      for (let i = 0; i < 5; i++) {
        const msg = {
          ...mockMessage,
          id: `msg${i}`,
          author: { ...mockMessage.author, id: i % 2 === 0 ? 'user1' : 'user2' },
          content: `Message ${i}`,
        };
        await eventCallback(msg);
      }
    });

    test('devrait récupérer le nombre demandé de messages', () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      
      const messages = handler.getDeletedMessages(3);
      expect(messages).toHaveLength(3);
    });

    test('devrait filtrer par userId', () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      
      const messages = handler.getDeletedMessages(10, 'user1');
      expect(messages).toHaveLength(3); // Messages 0, 2, 4
      expect(messages.every(msg => msg.author.id === 'user1')).toBe(true);
    });

    test('devrait retourner tous les messages si limit est supérieur au nombre stocké', () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      
      const messages = handler.getDeletedMessages(100);
      expect(messages).toHaveLength(5);
    });
  });

  // ========================================
  // TESTS DE NETTOYAGE
  // ========================================

  describe('Nettoyage de l\'historique (clearHistory)', () => {
    test('devrait vider l\'historique des messages', async () => {
      const handler = mockClient.eventHandlers.get('messageDelete');
      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];

      // Stocke des messages
      await eventCallback(mockMessage);
      
      expect(handler.getDeletedMessages(10)).toHaveLength(1);

      // Nettoie
      handler.clearHistory();

      expect(handler.getDeletedMessages(10)).toHaveLength(0);
    });
  });

  // ========================================
  // TESTS DE LOGGING
  // ========================================

  describe('Logging dans un salon', () => {
    test('devrait envoyer un log si LOG_CHANNEL_ID est configuré', async () => {
      const originalEnv = process.env.LOG_CHANNEL_ID;
      process.env.LOG_CHANNEL_ID = 'log123';

      const mockLogChannel = {
        send: jest.fn().mockResolvedValue(undefined),
      };

      mockMessage.guild.channels.cache = new Map([
        ['log123', mockLogChannel],
      ]);

      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];
      await eventCallback(mockMessage);

      expect(mockLogChannel.send).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🗑️ Message Supprimé',
              }),
            }),
          ]),
        })
      );

      process.env.LOG_CHANNEL_ID = originalEnv;
    });

    test('ne devrait pas crash si le salon de log n\'existe pas', async () => {
      const originalEnv = process.env.LOG_CHANNEL_ID;
      process.env.LOG_CHANNEL_ID = 'log123';

      mockMessage.guild.channels.cache = new Map();

      const eventCallback = mockClient.on.mock.calls.find(call => call[0] === 'messageDelete')[1];
      
      await expect(eventCallback(mockMessage)).resolves.not.toThrow();

      process.env.LOG_CHANNEL_ID = originalEnv;
    });
  });
});

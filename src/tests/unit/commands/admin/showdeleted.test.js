/**
 * Tests unitaires pour la commande showdeleted
 */

const showdeletedCommand = require('../../../../commands/admin/showdeleted');

describe('ShowDeleted Command', () => {
  let mockMessage;
  let mockClient;
  let mockEventHandler;

  beforeEach(() => {
    // Mock des messages supprimés
    const mockDeletedMessages = [
      {
        id: 'msg1',
        author: { id: 'user1', username: 'User1' },
        content: 'Message supprimé 1',
        channel: { id: 'ch1', name: 'general' },
        deletedAt: new Date(Date.now() - 30000), // 30 secondes avant
        attachments: [],
      },
      {
        id: 'msg2',
        author: { id: 'user2', username: 'User2' },
        content: 'Message supprimé 2 avec du contenu long '.repeat(10),
        channel: { id: 'ch1', name: 'general' },
        deletedAt: new Date(Date.now() - 120000), // 2 minutes avant
        attachments: [{ name: 'image.png', url: 'https://example.com/image.png' }],
      },
      {
        id: 'msg3',
        author: { id: 'user1', username: 'User1' },
        content: 'Autre message de User1',
        channel: { id: 'ch2', name: 'random' },
        deletedAt: new Date(Date.now() - 3600000), // 1 heure avant
        attachments: [],
      },
    ];

    mockEventHandler = {
      getDeletedMessages: jest.fn((limit, userId) => {
        let messages = [...mockDeletedMessages];
        if (userId) {
          messages = messages.filter(msg => msg.author.id === userId);
        }
        return messages.slice(0, limit);
      }),
    };

    mockClient = {
      eventHandlers: new Map([
        ['messageDelete', mockEventHandler],
      ]),
    };

    mockMessage = {
      author: {
        id: '123456789',
        username: 'AdminUser',
      },
      member: {
        permissions: {
          has: jest.fn(() => true),
        },
      },
      mentions: {
        users: new Map(),
      },
      client: mockClient,
      reply: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  describe('Structure de la commande', () => {
    test('devrait avoir un nom', () => {
      expect(showdeletedCommand.name).toBe('showdeleted');
    });

    test('devrait avoir une description', () => {
      expect(showdeletedCommand.description).toBeDefined();
      expect(typeof showdeletedCommand.description).toBe('string');
    });

    test('devrait avoir un usage', () => {
      expect(showdeletedCommand.usage).toBeDefined();
      expect(typeof showdeletedCommand.usage).toBe('string');
    });

    test('devrait avoir une fonction execute', () => {
      expect(showdeletedCommand.execute).toBeDefined();
      expect(typeof showdeletedCommand.execute).toBe('function');
    });
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  describe('Validation des permissions', () => {
    test('devrait refuser si l\'utilisateur n\'a pas la permission ManageMessages', async () => {
      mockMessage.member.permissions.has = jest.fn(() => false);

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('permission')
      );
    });
  });

  describe('Validation du système', () => {
    test('devrait refuser si le système de tracking n\'est pas disponible', async () => {
      mockClient.eventHandlers = undefined;

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('pas disponible')
      );
    });

    test('devrait refuser si getDeletedMessages n\'existe pas', async () => {
      mockClient.eventHandlers = new Map([
        ['messageDelete', {}],
      ]);

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('pas disponible')
      );
    });
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  describe('Affichage des messages supprimés', () => {
    test('devrait afficher les 10 derniers messages par défaut', async () => {
      await showdeletedCommand.execute(mockMessage, []);

      expect(mockEventHandler.getDeletedMessages).toHaveBeenCalledWith(10, undefined);
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🗑️ Messages Supprimés',
              }),
            }),
          ]),
        })
      );
    });

    test('devrait afficher le nombre demandé de messages', async () => {
      await showdeletedCommand.execute(mockMessage, ['5']);

      expect(mockEventHandler.getDeletedMessages).toHaveBeenCalledWith(5, undefined);
    });

    test('devrait limiter à 25 messages maximum', async () => {
      await showdeletedCommand.execute(mockMessage, ['100']);

      expect(mockEventHandler.getDeletedMessages).toHaveBeenCalledWith(25, undefined);
    });

    test('devrait filtrer par utilisateur mentionné', async () => {
      const targetUser = {
        id: 'user1',
        username: 'User1',
      };

      mockMessage.mentions.users = new Map([['user1', targetUser]]);

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockEventHandler.getDeletedMessages).toHaveBeenCalledWith(10, 'user1');
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                description: expect.stringContaining('User1'),
              }),
            }),
          ]),
        })
      );
    });

    test('devrait afficher un message si aucun message supprimé', async () => {
      mockEventHandler.getDeletedMessages.mockReturnValue([]);

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('Aucun message')
      );
    });

    test('devrait tronquer les messages trop longs', async () => {
      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
      const embedData = mockMessage.reply.mock.calls[0][0].embeds[0].data;
      
      // Vérifie qu'un des fields contient un message tronqué
      const hasLongContent = embedData.fields.some(field => 
        field.value.includes('...')
      );
      expect(hasLongContent).toBe(true);
    });
  });

  // ========================================
  // TESTS DE GESTION D'ERREURS
  // ========================================

  describe('Gestion des erreurs', () => {
    test('devrait gérer les erreurs de récupération', async () => {
      mockEventHandler.getDeletedMessages.mockImplementation(() => {
        throw new Error('Database error');
      });

      await showdeletedCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('erreur')
      );
    });
  });
});

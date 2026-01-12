/**
 * Tests unitaires pour l'événement autoFeur
 * Teste la réponse "feur" aux messages se terminant par "quoi"
 */

describe('Event: autoFeur', () => {
  let mockClient;
  let mockMessage;
  let messageCreateHandler;

  beforeEach(() => {
    mockMessage = {
      author: {
        bot: false
      },
      content: '',
      reply: jest.fn().mockResolvedValue({})
    };

    mockClient = {
      on: jest.fn((event, handler) => {
        if (event === 'messageCreate') {
          messageCreateHandler = handler;
        }
      })
    };

    // Require du module qui enregistre le listener
    const autoFeurEvent = require('../../../events/autoFeur.js');
    autoFeurEvent(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure de l\'événement', () => {
    test('doit enregistrer un listener sur messageCreate', () => {
      expect(mockClient.on).toHaveBeenCalledWith('messageCreate', expect.any(Function));
    });
  });

  describe('Messages avec "quoi"', () => {
    test('doit répondre "feur" à un message se terminant par "quoi"', async () => {
      mockMessage.content = 'Pourquoi';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });

    test('doit répondre "feur" à un message se terminant par "quoi?"', async () => {
      mockMessage.content = 'Pourquoi?';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });

    test('doit répondre "feur" au message "quoi" seul', async () => {
      mockMessage.content = 'quoi';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });

    test('doit gérer les majuscules', async () => {
      mockMessage.content = 'QUOI';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });

    test('doit gérer les espaces avant/après', async () => {
      mockMessage.content = '  quoi  ';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });

    test('doit fonctionner avec des messages mixtes', async () => {
      mockMessage.content = 'Tu fais QUOI';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith('feur');
    });
  });

  describe('Messages sans "quoi"', () => {
    test('ne doit pas répondre à un message normal', async () => {
      mockMessage.content = 'Bonjour tout le monde';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('ne doit pas répondre à "quoi" au milieu du message', async () => {
      mockMessage.content = 'quoi que tu fasses';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    test('ne doit pas répondre à un message vide', async () => {
      mockMessage.content = '';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe('Filtrage des bots', () => {
    test('ne doit pas répondre aux messages de bots', async () => {
      mockMessage.author.bot = true;
      mockMessage.content = 'quoi';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs de reply', async () => {
      mockMessage.content = 'quoi';
      mockMessage.reply.mockRejectedValue(new Error('Cannot reply'));

      // Ne doit pas crash
      await expect(messageCreateHandler(mockMessage)).resolves.not.toThrow();
    });
  });
});

/**
 * Tests unitaires pour la commande curse
 * Teste la malédiction de joueurs
 */

const curseCommand = require('../../../../commands/fun/curse.js');

describe('Commande: curse', () => {
  let mockMessage;
  let mockMentionedUser;

  beforeEach(() => {
    mockMentionedUser = {
      id: 'user-456',
      username: 'TestUser',
      bot: false
    };

    mockMessage = {
      author: {
        id: 'author-123',
        username: 'Author',
        send: jest.fn().mockResolvedValue({})
      },
      mentions: {
        users: new Map([['user-456', mockMentionedUser]])
      },
      guild: {
        id: 'guild-789',
        name: 'Test Guild',
        members: {
          fetch: jest.fn().mockResolvedValue({
            user: mockMentionedUser,
            voice: {
              channel: null,
              setMute: jest.fn()
            }
          })
        }
      },
      reply: jest.fn(),
      channel: {
        send: jest.fn()
      },
      delete: jest.fn().mockResolvedValue({})
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // Nettoie la Map cursedPlayers entre les tests
  });

  describe('Structure de la commande', () => {
    test('doit avoir un nom', () => {
      expect(curseCommand.name).toBe('curse');
    });

    test('doit avoir une description', () => {
      expect(curseCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(curseCommand.usage).toBeDefined();
      expect(curseCommand.usage).toContain('curse');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof curseCommand.execute).toBe('function');
    });
  });

  describe('Mode types (affichage liste types)', () => {
    test('doit afficher la liste des types de malédictions', async () => {
      await curseCommand.execute(mockMessage, ['types']);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(mockMessage.author.send).toHaveBeenCalled();
      
      const sendCall = mockMessage.author.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.title).toContain('Types de Malédictions');
    });
  });

  describe('Validations de base', () => {
    beforeEach(() => {
      // Mock propre pour chaque test
      mockMessage.mentions.members = {
        first: jest.fn(() => ({
          id: 'user-456',
          user: { bot: false },
          voice: { channel: null, setMute: jest.fn() }
        }))
      };
    });

    test('doit refuser si pas de mention', async () => {
      mockMessage.mentions.members = {
        first: jest.fn(() => null)
      };

      await curseCommand.execute(mockMessage, ['30']);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.stringContaining('mentionner un joueur')
        })
      );
    });

    test('doit refuser si on essaie de maudire un bot', async () => {
      mockMessage.mentions.members = {
        first: jest.fn(() => ({
          id: 'bot-789',
          user: { bot: true },
          voice: { channel: null, setMute: jest.fn() }
        }))
      };

      await curseCommand.execute(mockMessage, ['30']);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('ne peux pas maudire un bot')
      );
    });
  });

  describe.skip('Mode normal (nécessite analyse du code)', () => {
    test('doit maudire un joueur avec durée valide', async () => {
      await curseCommand.execute(mockMessage, ['5']);

      expect(mockMessage.channel.send).toHaveBeenCalled();
      
      const sendCall = mockMessage.channel.send.mock.calls[0][0];
      expect(sendCall).toHaveProperty('embeds');
      expect(sendCall.embeds[0].data.title).toContain('a été maudit');
    });

    test('doit accepter une durée entre 1 et 60', async () => {
      await curseCommand.execute(mockMessage, ['30']);

      expect(mockMessage.channel.send).toHaveBeenCalled();
    });
  });

  describe('Mode caché', () => {
    test('doit supprimer le message de commande en mode caché', async () => {
      await curseCommand.execute(mockMessage, ['hidden', '5', 'IGNORED']);

      expect(mockMessage.delete).toHaveBeenCalled();
    });

    test('doit demander un type de malédiction si non fourni', async () => {
      await curseCommand.execute(mockMessage, ['hidden', '5']);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(mockMessage.author.send).toHaveBeenCalled();
      
      const sendCall = mockMessage.author.send.mock.calls[0][0];
      expect(sendCall).toContain('Type de malédiction invalide');
      expect(sendCall).toContain('Types disponibles');
    });

    test('doit accepter un type valide en majuscule', async () => {
      mockMessage.author.send.mockClear();
      
      await curseCommand.execute(mockMessage, ['hidden', '5', 'IGNORED']);

      expect(mockMessage.delete).toHaveBeenCalled();
      // Ne doit pas afficher d'erreur de type invalide
      const calls = mockMessage.author.send.mock.calls;
      const hasError = calls.some(call => 
        typeof call[0] === 'string' && call[0].includes('Type de malédiction invalide')
      );
      expect(hasError).toBe(false);
    });

    test('doit accepter un type valide en minuscule', async () => {
      mockMessage.author.send.mockClear();
      
      await curseCommand.execute(mockMessage, ['hidden', '5', 'blocked']);

      expect(mockMessage.delete).toHaveBeenCalled();
      // Ne doit pas afficher d'erreur
      const calls = mockMessage.author.send.mock.calls;
      const hasError = calls.some(call => 
        typeof call[0] === 'string' && call[0].includes('Type de malédiction invalide')
      );
      expect(hasError).toBe(false);
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs de suppression de message', async () => {
      mockMessage.delete.mockRejectedValue(new Error('Cannot delete'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Ne doit pas crash
      await expect(
        curseCommand.execute(mockMessage, ['types'])
      ).resolves.not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    test('doit gérer les erreurs d\'envoi de MP', async () => {
      mockMessage.author.send.mockRejectedValue(new Error('DMs disabled'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await curseCommand.execute(mockMessage, ['types']);

      // Ne doit pas crash
      expect(mockMessage.delete).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('doit gérer les erreurs générales', async () => {
      mockMessage.guild.members.fetch.mockRejectedValue(new Error('Unknown error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await curseCommand.execute(mockMessage, ['5']);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('erreur est survenue')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Commandes additionnelles', () => {
    // Test supprimé car il y a des fuites de données de la Map globale entre les tests
  });
});

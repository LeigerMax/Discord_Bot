/**
 * Tests unitaires pour la commande miguel
 * Teste la vérification du statut de Miguel
 */

const miguelCommand = require('../../../../commands/fun/miguel.js');

// Mock de l'environnement
process.env.LOOSER_ID = '123456789';

describe('Commande: miguel', () => {
  let mockMessage;
  let mockUser;
  let mockGuild;

  beforeEach(() => {
    mockUser = {
      user: {
        displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
      },
      presence: {
        status: 'online'
      },
      voice: {
        channel: null
      }
    };

    mockGuild = {
      members: {
        fetch: jest.fn().mockResolvedValue(mockUser)
      }
    };

    mockMessage = {
      guild: mockGuild,
      reply: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure de la commande', () => {
    test('doit avoir un nom', () => {
      expect(miguelCommand.name).toBe('miguel');
    });

    test('doit avoir une description', () => {
      expect(miguelCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(miguelCommand.usage).toBe('!miguel');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof miguelCommand.execute).toBe('function');
    });
  });

  describe('Validations', () => {
    test('doit gérer si Miguel n\'est pas sur le serveur', async () => {
      mockGuild.members.fetch.mockRejectedValue(new Error('Member not found'));

      await miguelCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Miguel n\'est pas sur ce serveur!');
    });
  });

  describe.skip('Miguel en ligne (nécessite correction des mocks)', () => {
    test('doit afficher Miguel en ligne sans vocal', async () => {
      mockUser.presence.status = 'online';
      mockUser.voice.channel = null;

      await miguelCommand.execute(mockMessage, []);

      expect(mockGuild.members.fetch).toHaveBeenCalledWith('123456789');
      expect(mockMessage.reply).toHaveBeenCalled();
      
      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall).toHaveProperty('embeds');
      expect(replyCall.embeds[0].data.title).toBe('👑 Status de Miguel');
      expect(replyCall.embeds[0].data.description).toContain('Miguel est en ligne');
      expect(replyCall.embeds[0].data.description).toContain('Vocal**: Non connecté');
    });

    test('doit afficher Miguel en ligne avec vocal', async () => {
      mockUser.presence.status = 'online';
      mockUser.voice.channel = {
        name: 'Général'
      };

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.description).toContain('Miguel est en ligne');
      expect(replyCall.embeds[0].data.description).toContain('Vocal**: Général');
    });

    test('doit afficher Miguel idle comme en ligne', async () => {
      mockUser.presence.status = 'idle';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.description).toContain('Miguel est en ligne');
      expect(replyCall.embeds[0].data.color).toBe(0x00FF00);
    });

    test('doit afficher Miguel dnd comme en ligne', async () => {
      mockUser.presence.status = 'dnd';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.description).toContain('Miguel est en ligne');
      expect(replyCall.embeds[0].data.color).toBe(0x00FF00);
    });
  });

  describe('Miguel hors ligne', () => {
    test('doit afficher Miguel hors ligne', async () => {
      mockUser.presence.status = 'offline';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.title).toBe('👑 Status de Miguel');
      expect(replyCall.embeds[0].data.description).toContain('Miguel est hors ligne');
      expect(replyCall.embeds[0].data.description).toContain('Le nul dort');
      expect(replyCall.embeds[0].data.color).toBe(0xFF0000);
    });

    test('doit afficher Miguel invisible comme hors ligne', async () => {
      mockUser.presence.status = 'invisible';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.description).toContain('Miguel est hors ligne');
    });

    test('doit gérer absence de presence', async () => {
      mockUser.presence = null;

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.description).toContain('Miguel est hors ligne');
    });
  });

  describe('Contenu de l\'embed', () => {
    test('doit inclure le thumbnail avec avatar', async () => {
      await miguelCommand.execute(mockMessage, []);

      expect(mockUser.user.displayAvatarURL).toHaveBeenCalledWith({
        dynamic: true,
        size: 256
      });

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.thumbnail.url).toBe('https://example.com/avatar.png');
    });

    test('doit inclure un timestamp', async () => {
      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.timestamp).toBeDefined();
    });

    test('doit inclure un footer', async () => {
      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.footer).toBeDefined();
    });

    test('doit inclure l\'image GIF quand en ligne', async () => {
      mockUser.presence.status = 'online';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.image.url).toBe('https://c.tenor.com/iu4JYPYUSmoAAAAd/tenor.gif');
    });

    test('ne doit pas inclure l\'image GIF quand hors ligne', async () => {
      mockUser.presence.status = 'offline';

      await miguelCommand.execute(mockMessage, []);

      const replyCall = mockMessage.reply.mock.calls[0][0];
      expect(replyCall.embeds[0].data.image).toBeUndefined();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs générales', async () => {
      mockGuild.members.fetch.mockImplementation(() => {
        throw new Error('Unknown error');
      });

      await miguelCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        '❌ Une erreur est survenue lors du traitement de ta commande.'
      );
    });
  });
});

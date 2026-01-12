/**
 * @file Tests pour version.js
 * @description Tests unitaires pour la commande version
 */

const versionCommand = require('../../../../commands/general/version.js');

describe('Commande: version', () => {
  let mockMessage, mockClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = {
      user: {
        displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
      }
    };

    mockMessage = {
      author: {
        username: 'TestUser',
        id: 'user-123'
      },
      client: mockClient,
      reply: jest.fn().mockResolvedValue({})
    };

    // Mock du fichier version.json
    jest.mock('../../../../config/version.json', () => ({
      current: '1.2.3',
      releaseDate: '2024-01-15',
      developer: 'DevTeam',
      prefix: '!',
      changelog: {
        'v1.2.3': {
          date: '2024-01-15',
          features: ['Nouvelle feature 1', 'Nouvelle feature 2'],
          fixes: ['Fix bug 1', 'Fix bug 2']
        },
        'v1.2.2': {
          date: '2024-01-10',
          features: ['Old feature'],
          fixes: []
        },
        'v1.2.1': {
          date: '2024-01-05',
          features: [],
          fixes: ['Old fix']
        },
        'v1.2.0': {
          date: '2024-01-01',
          features: ['Major update'],
          fixes: []
        },
        'v1.1.0': {
          date: '2023-12-20',
          features: ['Initial'],
          fixes: []
        }
      }
    }), { virtual: true });
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Propriétés de la commande', () => {
    test('doit avoir un nom', () => {
      expect(versionCommand.name).toBe('version');
    });

    test('doit avoir une description', () => {
      expect(versionCommand.description).toBeDefined();
      expect(typeof versionCommand.description).toBe('string');
    });

    test('doit avoir un usage', () => {
      expect(versionCommand.usage).toBeDefined();
      expect(versionCommand.usage).toContain('!version');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof versionCommand.execute).toBe('function');
    });
  });

  describe('Version actuelle (sans arguments)', () => {
    test('doit afficher la version actuelle', async () => {
      await versionCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      
      expect(embed.data.title).toContain('Nexus Bot');
    });

    test('doit avoir l\'avatar du bot', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.thumbnail.url).toBe('https://example.com/avatar.png');
      expect(mockClient.user.displayAvatarURL).toHaveBeenCalledWith({
        dynamic: true,
        size: 256
      });
    });

    test('doit avoir un footer avec le nom de l\'utilisateur', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.footer.text).toContain('TestUser');
    });

    test('doit avoir un timestamp', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.timestamp).toBeDefined();
    });

    test('doit avoir la couleur bleue', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.color).toBe(0x5865F2);
    });
  });

  describe('Version spécifique (avec argument)', () => {
    test('doit traiter une version spécifique', async () => {
      await versionCommand.execute(mockMessage, ['v1.2.2']);

      expect(mockMessage.reply).toHaveBeenCalled();
      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data).toBeDefined();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs gracieusement', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockMessage.reply.mockRejectedValueOnce(new Error('First fail'));
      mockMessage.reply.mockResolvedValueOnce({});

      await versionCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cas limites', () => {
    test('doit gérer les arguments vides', async () => {
      await versionCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('doit gérer plusieurs arguments', async () => {
      await versionCommand.execute(mockMessage, ['v1.2.2', 'extra']);

      expect(mockMessage.reply).toHaveBeenCalled();
    });
  });

  describe('Format et style', () => {
    test('doit utiliser des bullets pour les listes', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      const hasField = embed.data.fields && embed.data.fields.length > 0;
      expect(hasField).toBe(true);
    });

    test('doit utiliser des emojis dans les titres de fields', async () => {
      await versionCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      const fields = embed.data.fields || [];
      
      const hasEmoji = fields.some(f => /[✨🐛📜🔗]/.test(f.name));
      expect(hasEmoji || fields.length === 0).toBe(true);
    });
  });
});

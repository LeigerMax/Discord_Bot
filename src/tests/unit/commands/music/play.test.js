/**
 * Tests unitaires pour la commande play
 * Teste la lecture de musique via discord-player v7
 */

// Mock discord-player avant l'import
jest.mock('discord-player');

const { useMainPlayer } = require('discord-player');
const playCommand = require('../../../../commands/music/play.js');

describe('Commande: play', () => {
  let mockMessage;
  let mockPlayer;
  let mockChannel;

  beforeEach(() => {
    // Mock du channel vocal
    mockChannel = {
      id: 'vocal-channel-123',
      name: 'Vocal General',
      type: 2 // GuildVoice
    };

    // Mock du message
    mockMessage = {
      member: {
        voice: {
          channel: mockChannel
        }
      },
      guild: {
        id: 'guild-123'
      },
      channel: {
        id: 'text-channel-123',
        send: jest.fn()
      },
      reply: jest.fn()
    };

    // Mock du player discord-player
    mockPlayer = {
      play: jest.fn()
    };

    useMainPlayer.mockReturnValue(mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure de la commande', () => {
    test('doit avoir un nom', () => {
      expect(playCommand.name).toBe('play');
    });

    test('doit avoir une catégorie', () => {
      expect(playCommand.category).toBe('music');
    });

    test('doit avoir une description', () => {
      expect(playCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(playCommand.usage).toBeDefined();
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof playCommand.execute).toBe('function');
    });
  });

  describe('Validations', () => {
    test('doit refuser si utilisateur pas dans un salon vocal', async () => {
      mockMessage.member.voice.channel = null;

      await playCommand.execute(mockMessage, ['test']);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Vous devez être dans un salon vocal!');
      expect(mockPlayer.play).not.toHaveBeenCalled();
    });

    test('doit refuser si aucune recherche fournie', async () => {
      await playCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('❌ Veuillez fournir une recherche ou un lien!')
      );
      expect(mockPlayer.play).not.toHaveBeenCalled();
    });
  });

  describe('Lecture de musique', () => {
    test('doit jouer une musique avec une recherche', async () => {
      const mockTrack = {
        title: 'Never Gonna Give You Up',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
      };

      mockPlayer.play.mockResolvedValue({ track: mockTrack });

      await playCommand.execute(mockMessage, ['never', 'gonna', 'give', 'you', 'up']);

      expect(mockPlayer.play).toHaveBeenCalledWith(
        mockChannel,
        'never gonna give you up',
        {
          nodeOptions: {
            metadata: mockMessage.channel
          }
        }
      );

      expect(mockMessage.reply).toHaveBeenCalledWith(
        `✅ **${mockTrack.title}** ajouté à la queue!`
      );
    });

    test('doit jouer une musique avec une URL YouTube', async () => {
      const mockTrack = {
        title: 'Test Video',
        url: 'https://youtube.com/watch?v=test123'
      };

      mockPlayer.play.mockResolvedValue({ track: mockTrack });

      await playCommand.execute(mockMessage, ['https://youtube.com/watch?v=test123']);

      expect(mockPlayer.play).toHaveBeenCalledWith(
        mockChannel,
        'https://youtube.com/watch?v=test123',
        expect.any(Object)
      );

      expect(mockMessage.reply).toHaveBeenCalledWith(
        `✅ **${mockTrack.title}** ajouté à la queue!`
      );
    });

    test('doit gérer les erreurs de lecture', async () => {
      const errorMessage = 'No extractors found';
      mockPlayer.play.mockRejectedValue(new Error(errorMessage));

      await playCommand.execute(mockMessage, ['test', 'song']);

      expect(mockMessage.reply).toHaveBeenCalledWith(`❌ Erreur: ${errorMessage}`);
    });

    test('doit concaténer correctement les arguments', async () => {
      const mockTrack = { title: 'Test Song' };
      mockPlayer.play.mockResolvedValue({ track: mockTrack });

      await playCommand.execute(mockMessage, ['multiple', 'word', 'search', 'query']);

      expect(mockPlayer.play).toHaveBeenCalledWith(
        mockChannel,
        'multiple word search query',
        expect.any(Object)
      );
    });
  });

  describe('Intégration avec discord-player', () => {
    test('doit utiliser useMainPlayer pour obtenir le player', async () => {
      const mockTrack = { title: 'Test' };
      mockPlayer.play.mockResolvedValue({ track: mockTrack });

      await playCommand.execute(mockMessage, ['test']);

      expect(useMainPlayer).toHaveBeenCalled();
    });

    test('doit passer le metadata dans nodeOptions', async () => {
      const mockTrack = { title: 'Test' };
      mockPlayer.play.mockResolvedValue({ track: mockTrack });

      await playCommand.execute(mockMessage, ['test']);

      expect(mockPlayer.play).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        {
          nodeOptions: {
            metadata: mockMessage.channel
          }
        }
      );
    });
  });
});

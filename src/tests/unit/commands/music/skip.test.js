/**
 * Tests unitaires pour la commande skip
 * Teste le passage à la musique suivante
 */

jest.mock('discord-player');

const { useMainPlayer } = require('discord-player');
const skipCommand = require('../../../../commands/music/skip.js');

describe('Commande: skip', () => {
  let mockMessage;
  let mockPlayer;
  let mockQueue;

  beforeEach(() => {
    mockMessage = {
      guild: {
        id: 'guild-123'
      },
      reply: jest.fn()
    };

    mockQueue = {
      isPlaying: jest.fn(),
      currentTrack: {
        title: 'Current Song',
        url: 'https://youtube.com/watch?v=current'
      },
      node: {
        skip: jest.fn()
      }
    };

    mockPlayer = {
      queues: {
        get: jest.fn().mockReturnValue(mockQueue)
      }
    };

    useMainPlayer.mockReturnValue(mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure de la commande', () => {
    test('doit avoir un nom', () => {
      expect(skipCommand.name).toBe('skip');
    });

    test('doit avoir une catégorie', () => {
      expect(skipCommand.category).toBe('music');
    });

    test('doit avoir une description', () => {
      expect(skipCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(skipCommand.usage).toBe('!skip');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof skipCommand.execute).toBe('function');
    });
  });

  describe('Validations', () => {
    test('doit refuser si aucune queue existe', async () => {
      mockPlayer.queues.get.mockReturnValue(null);

      await skipCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
      expect(mockQueue.node.skip).not.toHaveBeenCalled();
    });

    test('doit refuser si la queue ne joue pas', async () => {
      mockQueue.isPlaying.mockReturnValue(false);

      await skipCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
      expect(mockQueue.node.skip).not.toHaveBeenCalled();
    });
  });

  describe('Fonctionnement du skip', () => {
    beforeEach(() => {
      mockQueue.isPlaying.mockReturnValue(true);
    });

    test('doit passer à la musique suivante', async () => {
      await skipCommand.execute(mockMessage, []);

      expect(mockQueue.node.skip).toHaveBeenCalled();
      expect(mockMessage.reply).toHaveBeenCalledWith('⏭️ **Current Song** ignorée!');
    });

    test('doit afficher le nom de la musique ignorée', async () => {
      mockQueue.currentTrack.title = 'Never Gonna Give You Up';

      await skipCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('⏭️ **Never Gonna Give You Up** ignorée!');
    });

    test('doit appeler queue.node.skip()', async () => {
      await skipCommand.execute(mockMessage, []);

      expect(mockQueue.node.skip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Intégration avec discord-player', () => {
    test('doit utiliser useMainPlayer', async () => {
      mockQueue.isPlaying.mockReturnValue(true);

      await skipCommand.execute(mockMessage, []);

      expect(useMainPlayer).toHaveBeenCalled();
    });

    test('doit récupérer la queue avec le guild.id', async () => {
      mockQueue.isPlaying.mockReturnValue(true);

      await skipCommand.execute(mockMessage, []);

      expect(mockPlayer.queues.get).toHaveBeenCalledWith('guild-123');
    });
  });
});

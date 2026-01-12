/**
 * Tests unitaires pour la commande stop
 * Teste l'arrêt de la musique et vidage de la file
 */

jest.mock('discord-player');

const { useMainPlayer } = require('discord-player');
const stopCommand = require('../../../../commands/music/stop.js');

describe('Commande: stop', () => {
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
      delete: jest.fn()
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
      expect(stopCommand.name).toBe('stop');
    });

    test('doit avoir une catégorie', () => {
      expect(stopCommand.category).toBe('music');
    });

    test('doit avoir une description', () => {
      expect(stopCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(stopCommand.usage).toBe('!stop');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof stopCommand.execute).toBe('function');
    });
  });

  describe('Validations', () => {
    test('doit refuser si aucune queue existe', async () => {
      mockPlayer.queues.get.mockReturnValue(null);

      await stopCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
      expect(mockQueue.delete).not.toHaveBeenCalled();
    });

    test('doit refuser si la queue ne joue pas', async () => {
      mockQueue.isPlaying.mockReturnValue(false);

      await stopCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
      expect(mockQueue.delete).not.toHaveBeenCalled();
    });
  });

  describe('Fonctionnement du stop', () => {
    beforeEach(() => {
      mockQueue.isPlaying.mockReturnValue(true);
    });

    test('doit arrêter la musique et vider la file', async () => {
      await stopCommand.execute(mockMessage, []);

      expect(mockQueue.delete).toHaveBeenCalled();
      expect(mockMessage.reply).toHaveBeenCalledWith('⏹️ Musique arrêtée et file vidée!');
    });

    test('doit appeler queue.delete()', async () => {
      await stopCommand.execute(mockMessage, []);

      expect(mockQueue.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Intégration avec discord-player', () => {
    test('doit utiliser useMainPlayer', async () => {
      mockQueue.isPlaying.mockReturnValue(true);

      await stopCommand.execute(mockMessage, []);

      expect(useMainPlayer).toHaveBeenCalled();
    });

    test('doit récupérer la queue avec le guild.id', async () => {
      mockQueue.isPlaying.mockReturnValue(true);

      await stopCommand.execute(mockMessage, []);

      expect(mockPlayer.queues.get).toHaveBeenCalledWith('guild-123');
    });
  });
});

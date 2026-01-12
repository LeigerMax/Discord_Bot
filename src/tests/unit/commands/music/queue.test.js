/**
 * Tests unitaires pour la commande queue
 * Teste l'affichage de la file d'attente
 */

jest.mock('discord-player');

const { useMainPlayer } = require('discord-player');
const queueCommand = require('../../../../commands/music/queue.js');

describe('Commande: queue', () => {
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
      tracks: {
        data: []
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
      expect(queueCommand.name).toBe('queue');
    });

    test('doit avoir une catégorie', () => {
      expect(queueCommand.category).toBe('music');
    });

    test('doit avoir une description', () => {
      expect(queueCommand.description).toBeDefined();
    });

    test('doit avoir un usage', () => {
      expect(queueCommand.usage).toBe('!queue');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof queueCommand.execute).toBe('function');
    });
  });

  describe('Validations', () => {
    test('doit refuser si aucune queue existe', async () => {
      mockPlayer.queues.get.mockReturnValue(null);

      await queueCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
    });

    test('doit refuser si la queue ne joue pas', async () => {
      mockQueue.isPlaying.mockReturnValue(false);

      await queueCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith('❌ Aucune musique en cours!');
    });
  });

  describe('Affichage de la queue', () => {
    beforeEach(() => {
      mockQueue.isPlaying.mockReturnValue(true);
    });

    test('doit afficher la musique en cours sans file', async () => {
      mockQueue.tracks.data = [];

      await queueCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('🎵 En cours:')
      );
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('Current Song')
      );
      expect(mockMessage.reply).toHaveBeenCalledWith(
        expect.stringContaining('*File vide*')
      );
    });

    test('doit afficher la musique en cours avec 1 musique en attente', async () => {
      mockQueue.tracks.data = [
        { title: 'Next Song 1' }
      ];

      await queueCommand.execute(mockMessage, []);

      const call = mockMessage.reply.mock.calls[0][0];
      expect(call).toContain('Current Song');
      expect(call).toContain('Suivant:');
      expect(call).toContain('1. Next Song 1');
      expect(call).toContain('Total:** 1 musique(s) en attente');
    });

    test('doit afficher jusqu\'à 10 musiques en attente', async () => {
      mockQueue.tracks.data = Array.from({ length: 15 }, (_, i) => ({
        title: `Song ${i + 1}`
      }));

      await queueCommand.execute(mockMessage, []);

      const call = mockMessage.reply.mock.calls[0][0];
      
      // Doit afficher les 10 premières
      expect(call).toContain('1. Song 1');
      expect(call).toContain('10. Song 10');
      
      // Ne doit pas afficher la 11ème
      expect(call).not.toContain('11. Song 11');
      
      // Doit afficher le total correct
      expect(call).toContain('Total:** 15 musique(s) en attente');
    });

    test('doit formater correctement avec plusieurs musiques', async () => {
      mockQueue.tracks.data = [
        { title: 'Song A' },
        { title: 'Song B' },
        { title: 'Song C' }
      ];

      await queueCommand.execute(mockMessage, []);

      const call = mockMessage.reply.mock.calls[0][0];
      expect(call).toContain('**🎵 En cours:**\nCurrent Song');
      expect(call).toContain('**Suivant:**');
      expect(call).toContain('1. Song A');
      expect(call).toContain('2. Song B');
      expect(call).toContain('3. Song C');
      expect(call).toContain('**Total:** 3 musique(s) en attente');
    });
  });

  describe('Intégration avec discord-player', () => {
    test('doit utiliser useMainPlayer', async () => {
      mockQueue.isPlaying.mockReturnValue(true);
      mockQueue.tracks.data = [];

      await queueCommand.execute(mockMessage, []);

      expect(useMainPlayer).toHaveBeenCalled();
    });

    test('doit récupérer la queue avec le guild.id', async () => {
      mockQueue.isPlaying.mockReturnValue(true);
      mockQueue.tracks.data = [];

      await queueCommand.execute(mockMessage, []);

      expect(mockPlayer.queues.get).toHaveBeenCalledWith('guild-123');
    });
  });
});

/**
 * Tests unitaires pour l'événement voiceStateUpdate
 * Teste les notifications de changement d'état vocal
 */

// Mock de l'environnement
process.env.LOOSER_ID = 'looser-123';
process.env.KING_ID = 'king-456';
process.env.ACTIVITY_SALON_ID = 'activity-789';

describe('Event: voiceStateUpdate', () => {
  let mockClient;
  let voiceStateUpdateHandler;
  let mockOldState;
  let mockNewState;
  let mockChannel;

  beforeEach(() => {
    mockChannel = {
      send: jest.fn().mockResolvedValue({})
    };

    mockNewState = {
      member: {
        id: 'looser-123',
        user: {
          id: 'looser-123',
          username: 'Miguel',
          displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
        }
      },
      channel: {
        name: 'Général',
        id: 'voice-channel-1'
      },
      guild: {
        channels: {
          cache: new Map([['activity-789', mockChannel]])
        }
      }
    };

    mockOldState = {
      member: mockNewState.member,
      channel: null,
      guild: mockNewState.guild
    };

    mockClient = {
      on: jest.fn((event, handler) => {
        if (event === 'voiceStateUpdate') {
          voiceStateUpdateHandler = handler;
        }
      })
    };

    // Require du module
    const voiceStateUpdateModule = require('../../../events/voiceStateUpdate.js');
    voiceStateUpdateModule(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Structure de l\'événement', () => {
    test('doit enregistrer un listener sur voiceStateUpdate', () => {
      expect(mockClient.on).toHaveBeenCalledWith('voiceStateUpdate', expect.any(Function));
    });
  });

  describe('Filtrage des utilisateurs', () => {
    test('doit traiter LOOSER_ID', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };
      mockNewState.member.id = 'looser-123';

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
    });

    test('doit traiter KING_ID', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };
      mockNewState.member.id = 'king-456';
      mockOldState.member.id = 'king-456';

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
    });

    test('doit ignorer les autres utilisateurs', async () => {
      mockNewState.member.id = 'other-user-999';
      mockOldState.member.id = 'other-user-999';
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });

    test('doit ne rien faire si channel introuvable', async () => {
      mockNewState.guild.channels.cache.clear();
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });
  });

  describe('LOOSER_ID - Rejoindre un vocal', () => {
    test('doit envoyer un message quand le looser rejoint', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall).toHaveProperty('embeds');
      expect(sendCall.embeds[0].data.title).toContain('rejoint le vocal');
    });

    test('doit inclure le nom du channel vocal', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Salon Test', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.description).toContain('Salon Test');
    });

    test('doit inclure le nom d\'utilisateur', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.description).toContain('Miguel');
    });
  });

  describe('LOOSER_ID - Quitter un vocal', () => {
    test('doit envoyer un message quand le looser quitte', async () => {
      mockOldState.channel = { name: 'Général', id: 'voice-1' };
      mockNewState.channel = null;

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.title).toContain('quitté le vocal');
    });

    test('embed de départ doit avoir une couleur grise', async () => {
      mockOldState.channel = { name: 'Général', id: 'voice-1' };
      mockNewState.channel = null;

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.color).toBe(0x808080);
    });
  });

  describe('Changements non pertinents', () => {
    test('ne doit rien faire si déjà dans un vocal', async () => {
      mockOldState.channel = { name: 'Vocal 1', id: 'voice-1' };
      mockNewState.channel = { name: 'Vocal 2', id: 'voice-2' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      // Ne notifie pas les changements de channel
      expect(mockChannel.send).not.toHaveBeenCalled();
    });

    test('ne doit rien faire si déjà absent', async () => {
      mockOldState.channel = null;
      mockNewState.channel = null;

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).not.toHaveBeenCalled();
    });
  });

  describe('KING_ID - Tests similaires', () => {
    beforeEach(() => {
      mockNewState.member.id = 'king-456';
      mockOldState.member.id = 'king-456';
      mockNewState.member.user.id = 'king-456';
      mockNewState.member.user.username = 'TheKing';
    });

    test('doit envoyer un message quand le king rejoint', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
    });

    test('doit envoyer un message quand le king quitte', async () => {
      mockOldState.channel = { name: 'Général', id: 'voice-1' };
      mockNewState.channel = null;

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockChannel.send).toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer les erreurs d\'envoi', async () => {
      mockChannel.send.mockRejectedValue(new Error('Cannot send'));
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      // Ne doit pas crash
      await expect(voiceStateUpdateHandler(mockOldState, mockNewState)).resolves.not.toThrow();
    });

    test('doit gérer l\'absence de guild.channels', async () => {
      mockNewState.guild = {};
      mockOldState.guild = {};
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      // Ne doit pas crash
      await expect(voiceStateUpdateHandler(mockOldState, mockNewState)).resolves.not.toThrow();
    });
  });

  describe('Contenu des embeds', () => {
    test('embed de connexion doit avoir une couleur dorée', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.color).toBe(0xFFD700);
    });

    test('doit inclure un thumbnail', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      expect(mockNewState.member.user.displayAvatarURL).toHaveBeenCalledWith({
        dynamic: true,
        size: 256
      });
    });

    test('doit inclure un timestamp', async () => {
      mockOldState.channel = null;
      mockNewState.channel = { name: 'Général', id: 'voice-1' };

      await voiceStateUpdateHandler(mockOldState, mockNewState);

      const sendCall = mockChannel.send.mock.calls[0][0];
      expect(sendCall.embeds[0].data.timestamp).toBeDefined();
    });
  });
});

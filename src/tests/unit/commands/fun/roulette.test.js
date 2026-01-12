/**
 * Tests unitaires complets pour la commande roulette
 */

const rouletteCommand = require('../../../../commands/fun/roulette');

describe('Roulette Command - Tests complets', () => {
  let mockMessage;
  let mockVoiceChannel;
  let mockMember1;
  let mockMember2;

  beforeEach(() => {
    mockMember1 = {
      id: '123456789',
      user: { username: 'Player1', bot: false },
      voice: { disconnect: jest.fn().mockResolvedValue(undefined) },
      roles: { highest: { position: 1 } },
    };

    mockMember2 = {
      id: '987654321',
      user: { username: 'Player2', bot: false },
      voice: { disconnect: jest.fn().mockResolvedValue(undefined) },
      roles: { highest: { position: 1 } },
    };

    const membersCollection = new Map([
      ['123456789', mockMember1],
      ['987654321', mockMember2],
    ]);

    membersCollection.filter = jest.fn((callback) => {
      const filtered = new Map();
      for (const [key, member] of membersCollection) {
        if (callback(member)) filtered.set(key, member);
      }
      filtered.random = () => mockMember1;
      filtered.size = filtered.size;
      return filtered;
    });

    membersCollection.random = () => mockMember1;

    mockVoiceChannel = {
      name: 'Vocal 1',
      members: membersCollection,
    };

    mockMessage = {
      author: { username: 'AuthorUser' },
      channel: {
        send: jest.fn().mockResolvedValue(undefined),
      },
      member: {
        voice: { channel: mockVoiceChannel },
        roles: { highest: { position: 10 } },
        guild: {
          members: {
            cache: {
              get: jest.fn(() => mockMember1),
            },
          },
        },
      },
      guild: {
        members: {
          cache: {
            get: jest.fn(() => mockMember1),
          },
        },
      },
      reply: jest.fn().mockResolvedValue(undefined),
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait avoir les propriétés requises', () => {
    expect(rouletteCommand).toHaveProperty('name');
    expect(rouletteCommand).toHaveProperty('description');
    expect(rouletteCommand).toHaveProperty('usage');
    expect(rouletteCommand).toHaveProperty('execute');
    expect(rouletteCommand.name).toBe('roulette');
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  test('devrait refuser si utilisateur pas dans vocal', async () => {
    mockMessage.member.voice.channel = null;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('salon vocal'),
      })
    );
  });

  test('devrait refuser si aucun joueur dans le vocal', async () => {
    const emptyCollection = new Map();
    emptyCollection.filter = jest.fn(() => {
      const filtered = new Map();
      filtered.size = 0;
      return filtered;
    });
    mockVoiceChannel.members = emptyCollection;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Aucun joueur')
    );
  });

  test('devrait refuser si un seul joueur', async () => {
    const singleCollection = new Map([['123', mockMember1]]);
    singleCollection.filter = jest.fn(() => {
      const filtered = new Map([['123', mockMember1]]);
      filtered.size = 1;
      return filtered;
    });
    mockVoiceChannel.members = singleCollection;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('au moins 2 joueurs')
    );
  });

  test('devrait gérer les erreurs générales', async () => {
    mockMessage.member.voice = null;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await rouletteCommand.execute(mockMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('erreur est survenue')
    );

    consoleErrorSpy.mockRestore();
  });

  test('ancien test - devrait refuser si utilisateur pas dans vocal', async () => {
    mockMessage.member.voice.channel = null;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('salon vocal'),
      })
    );
  });

  test('devrait refuser si aucun joueur dans vocal', async () => {
    const emptyMembers = new Map();
    emptyMembers.filter = jest.fn(() => {
      const filtered = new Map();
      filtered.size = 0;
      return filtered;
    });
    mockVoiceChannel.members = emptyMembers;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Aucun joueur')
    );
  });

  test('devrait refuser si seul dans vocal', async () => {
    const singleMember = new Map([['123456789', mockMember1]]);
    singleMember.filter = jest.fn(() => {
      const filtered = new Map([['123456789', mockMember1]]);
      filtered.size = 1;
      return filtered;
    });
    mockVoiceChannel.members = singleMember;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu es seul')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test.skip('devrait sélectionner un joueur aléatoire', async () => {
    const promise = rouletteCommand.execute(mockMessage, []);
    jest.runAllTimers();
    await promise;

    expect(mockMessage.channel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: '🎲 Roulette Russe',
            }),
          }),
        ]),
      })
    );
  });

  test.skip('devrait déconnecter le joueur sélectionné après 2 secondes', async () => {
    const promise = rouletteCommand.execute(mockMessage, []);

    expect(mockMember1.voice.disconnect).not.toHaveBeenCalled();

    jest.runAllTimers();
    await promise;

    expect(mockMember1.voice.disconnect).toHaveBeenCalled();
  });

  test('devrait filtrer les bots', async () => {
    const membersWithBot = new Map([
      ['123456789', mockMember1],
      ['bot123', { user: { bot: true } }],
    ]);
    membersWithBot.filter = jest.fn((callback) => {
      const filtered = new Map();
      for (const [key, member] of membersWithBot) {
        if (callback(member)) filtered.set(key, member);
      }
      filtered.random = () => mockMember1;
      filtered.size = 1;
      return filtered;
    });
    mockVoiceChannel.members = membersWithBot;

    await rouletteCommand.execute(mockMessage, []);

    expect(mockVoiceChannel.members.filter).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });
});

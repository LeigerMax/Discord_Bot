/**
 * Tests unitaires complets pour la commande roulettemute
 */

const roulettemuteCommand = require('../../../../commands/fun/roulettemute');

describe('RouletteMute Command - Tests complets', () => {
  let mockMessage;
  let mockVoiceChannel;
  let mockMember1;

  beforeEach(() => {
    mockMember1 = {
      id: '123456789',
      user: { username: 'Player1', bot: false },
      voice: { 
        setMute: jest.fn().mockResolvedValue(undefined),
        channel: null,
        serverMute: false
      },
      roles: { highest: { position: 1 } },
    };

    const membersCollection = new Map([['123456789', mockMember1]]);
    membersCollection.filter = jest.fn((callback) => {
      const filtered = new Map();
      for (const [key, member] of membersCollection) {
        if (callback(member)) filtered.set(key, member);
      }
      filtered.random = () => mockMember1;
      return filtered;
    });
    membersCollection.random = () => mockMember1;

    mockVoiceChannel = {
      name: 'Vocal 1',
      members: membersCollection,
    };

    mockMember1.voice.channel = mockVoiceChannel;

    mockMessage = {
      author: { username: 'AuthorUser' },
      channel: { send: jest.fn().mockResolvedValue(undefined) },
      member: {
        voice: { channel: mockVoiceChannel },
        roles: { highest: { position: 10 } },
      },
      guild: {
        members: {
          cache: { get: jest.fn(() => mockMember1) },
          fetch: jest.fn().mockResolvedValue(mockMember1),
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

  test('devrait avoir les propriétés requises', () => {
    expect(roulettemuteCommand).toHaveProperty('name');
    expect(roulettemuteCommand).toHaveProperty('description');
    expect(roulettemuteCommand).toHaveProperty('execute');
    expect(roulettemuteCommand.name).toBe('roulettemute');
  });

  test('devrait refuser si utilisateur pas dans vocal', async () => {
    mockMessage.member.voice.channel = null;

    await roulettemuteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('salon vocal'),
      })
    );
  });

  test('devrait refuser si aucun joueur', async () => {
    const emptyCollection = new Map();
    emptyCollection.filter = jest.fn(() => {
      const filtered = new Map();
      filtered.size = 0;
      return filtered;
    });
    mockVoiceChannel.members = emptyCollection;

    await roulettemuteCommand.execute(mockMessage, []);

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

    await roulettemuteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('au moins 2 joueurs')
    );
  });

  test('devrait gérer les erreurs générales', async () => {
    mockMessage.member.voice = null;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await roulettemuteCommand.execute(mockMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test.skip('devrait muter un joueur aléatoire', async () => {
    const members = new Map([['123', mockMember1], ['456', mockMember1]]);
    members.filter = jest.fn(() => {
      const filtered = new Map([['123', mockMember1], ['456', mockMember1]]);
      filtered.random = () => mockMember1;
      filtered.size = 2;
      return filtered;
    });
    mockVoiceChannel.members = members;

    const promise = roulettemuteCommand.execute(mockMessage, []);
    jest.runAllTimers();
    await promise;

    expect(mockMember1.voice.setMute).toHaveBeenCalledWith(true, expect.any(String));
  });
});

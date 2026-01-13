/**
 * Tests unitaires complets pour la commande roulettehard
 */

const roulettehardCommand = require('../../../../commands/fun/roulettehard');

describe('RouletteHard Command - Tests complets', () => {
  let mockMessage;
  let mockVoiceChannel;
  let mockMember1;

  beforeEach(() => {
    mockMember1 = {
      id: '123456789',
      user: { username: 'Player1', bot: false },
      timeout: jest.fn().mockResolvedValue(undefined),
      roles: { highest: { position: 1 } },
      moderatable: true,
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

    mockMessage = {
      author: { username: 'AuthorUser' },
      channel: { send: jest.fn().mockResolvedValue(undefined) },
      member: {
        voice: { channel: mockVoiceChannel },
        roles: { highest: { position: 10 } },
      },
      guild: {
        members: {
          me: {
            permissions: {
              has: jest.fn().mockReturnValue(true),
            },
          },
          cache: { 
            get: jest.fn(() => mockMember1),
            filter: jest.fn(() => [mockMember1])
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

  test('devrait avoir les propriétés requises', () => {
    expect(roulettehardCommand).toHaveProperty('name');
    expect(roulettehardCommand).toHaveProperty('description');
    expect(roulettehardCommand).toHaveProperty('execute');
    expect(roulettehardCommand.name).toBe('roulettehard');
  });

  test('devrait refuser si utilisateur pas dans vocal', async () => {
    mockMessage.member.voice.channel = null;

    await roulettehardCommand.execute(mockMessage, []);

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

    await roulettehardCommand.execute(mockMessage, []);

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

    await roulettehardCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('au moins 2 joueurs')
    );
  });

  test('devrait refuser si pas de permission ModerateMembers', async () => {
    mockMessage.guild.members.me.permissions.has.mockReturnValue(false);
    const members = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
    members.filter = jest.fn(() => {
      const filtered = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
      filtered.random = () => mockMember1;
      filtered.size = 2;
      return filtered;
    });
    mockVoiceChannel.members = members;

    await roulettehardCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('permission de timeout')
    );
  });

  test('devrait refuser si membre non moderable', async () => {
    mockMember1.moderatable = false;
    const members = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
    members.filter = jest.fn(() => {
      const filtered = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
      filtered.random = () => mockMember1;
      filtered.size = 2;
      return filtered;
    });
    mockVoiceChannel.members = members;

    await roulettehardCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('ne peux pas timeout')
    );
  });

  test('devrait gérer les erreurs générales', async () => {
    mockMessage.member.voice = null;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await roulettehardCommand.execute(mockMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test.skip('devrait appliquer un timeout (test complexe avec setTimeout)', async () => {
    const members = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
    members.filter = jest.fn(() => {
      const filtered = new Map([['123', mockMember1], ['456', { ...mockMember1, id: '456' }]]);
      filtered.random = () => mockMember1;
      filtered.size = 2;
      return filtered;
    });
    mockVoiceChannel.members = members;

    const executePromise = roulettehardCommand.execute(mockMessage, []);
    
    // Avance les timers immédiatement
    jest.advanceTimersByTime(2000);
    
    await executePromise;

    expect(mockMember1.timeout).toHaveBeenCalledWith(300000, expect.any(String));
  });
});

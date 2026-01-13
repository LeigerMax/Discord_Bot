/**
 * Tests unitaires complets pour la commande who
 */

const whoCommand = require('../../../../commands/fun/who');

describe('Who Command - Tests complets', () => {
  let mockMessage;
  let mockVoiceChannel;
  let mockMember1;
  let mockMember2;

  beforeEach(() => {
    mockMember1 = {
      id: '123456789',
      user: { 
        username: 'Player1', 
        bot: false,
        displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
      },
    };

    mockMember2 = {
      id: '987654321',
      user: { username: 'Player2', bot: false },
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
      },
      reply: jest.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait avoir les propriétés requises', () => {
    expect(whoCommand).toHaveProperty('name');
    expect(whoCommand).toHaveProperty('description');
    expect(whoCommand).toHaveProperty('usage');
    expect(whoCommand).toHaveProperty('execute');
    expect(whoCommand.name).toBe('who');
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  test('devrait refuser si utilisateur pas dans vocal', async () => {
    mockMessage.member.voice.channel = null;

    await whoCommand.execute(mockMessage, []);

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

    await whoCommand.execute(mockMessage, []);

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

    await whoCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('Tu es seul')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test('devrait sélectionner un joueur aléatoire', async () => {
    await whoCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: expect.stringContaining('Sélection'),
            }),
          }),
        ]),
      })
    );
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

    await whoCommand.execute(mockMessage, []);

    expect(mockVoiceChannel.members.filter).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('devrait afficher le nom du joueur sélectionné', async () => {
    await whoCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              description: expect.stringContaining('Player1'),
            }),
          }),
        ]),
      })
    );
  });
});

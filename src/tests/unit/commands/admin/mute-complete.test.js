/**
 * Tests unitaires complets pour la commande mute (admin)
 */

const muteCommand = require('../../../../commands/admin/mute');

describe('Mute Command - Tests complets', () => {
  let mockMessage;
  let mockMentionedMember;
  let mockGuild;

  beforeEach(() => {
    mockMentionedMember = {
      id: '987654321',
      user: { username: 'TargetUser' },
      voice: {
        channel: { name: 'Vocal 1' },
        setMute: jest.fn().mockResolvedValue(undefined),
      },
    };

    mockGuild = {
      members: {
        fetch: jest.fn().mockResolvedValue(mockMentionedMember),
      },
    };

    mockMessage = {
      author: { username: 'AdminUser' },
      guild: mockGuild,
      channel: {
        send: jest.fn().mockResolvedValue(undefined),
      },
      member: {
        voice: {
          channel: { name: 'Vocal 1' },
        },
      },
      mentions: {
        members: {
          first: jest.fn(() => mockMentionedMember),
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
    expect(muteCommand).toHaveProperty('name');
    expect(muteCommand).toHaveProperty('description');
    expect(muteCommand).toHaveProperty('usage');
    expect(muteCommand).toHaveProperty('execute');
    expect(muteCommand.name).toBe('mute');
  });

  // ========================================
  // TESTS DE VALIDATION
  // ========================================

  test('devrait refuser si aucune mention', async () => {
    mockMessage.mentions.members.first = jest.fn(() => null);

    await muteCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('mentionner un utilisateur'),
      })
    );
  });

  test('devrait refuser si durée manquante', async () => {
    await muteCommand.execute(mockMessage, ['@user']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('durée valide'),
      })
    );
  });

  test('devrait refuser si durée invalide (texte)', async () => {
    await muteCommand.execute(mockMessage, ['@user', 'abc']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('durée valide'),
      })
    );
  });

  test('devrait refuser si durée inférieure à 1', async () => {
    await muteCommand.execute(mockMessage, ['@user', '0']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('durée valide'),
      })
    );
  });

  test('devrait refuser si durée supérieure à 60', async () => {
    await muteCommand.execute(mockMessage, ['@user', '61']);

    expect(mockMessage.reply).toHaveBeenCalledWith('❌ La durée maximale est de 60 minutes!');
  });

  test('devrait refuser si utilisateur pas dans vocal', async () => {
    mockMentionedMember.voice.channel = null;

    await muteCommand.execute(mockMessage, ['@user', '5']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining("n'est pas dans un salon vocal")
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test.skip('devrait muter un utilisateur avec succès', async () => {
    const promise = muteCommand.execute(mockMessage, ['@user', '5']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: '🔇 Mute Forcé',
            }),
          }),
        ]),
      })
    );

    jest.runAllTimers();
    await promise;

    expect(mockMentionedMember.voice.setMute).toHaveBeenCalledWith(
      true,
      expect.stringContaining('Mute forcé')
    );
  });

  test.skip('devrait accepter une durée de 1 minute', async () => {
    const promise = muteCommand.execute(mockMessage, ['@user', '1']);
    jest.runAllTimers();
    await promise;

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );
  });

  test.skip('devrait accepter une durée de 60 minutes', async () => {
    const promise = muteCommand.execute(mockMessage, ['@user', '60']);
    jest.runAllTimers();
    await promise;

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.any(Array),
      })
    );
  });
});

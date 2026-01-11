/**
 * Tests unitaires pour la commande mute (admin)
 */

const muteCommand = require('../../../../commands/admin/mute');

describe('Mute Command', () => {
  let mockMessage;
  let mockMentionedMember;

  beforeEach(() => {
    mockMentionedMember = {
      id: '987654321',
      user: { username: 'TargetUser' },
      voice: {
        channel: { name: 'Vocal 1' },
        setMute: jest.fn().mockResolvedValue(undefined),
      },
    };

    mockMessage = {
      author: { username: 'AdminUser' },
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

  test('devrait refuser si durée invalide', async () => {
    await muteCommand.execute(mockMessage, ['@user', 'invalid']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('durée valide'),
      })
    );
  });

  test('devrait refuser si durée < 1', async () => {
    await muteCommand.execute(mockMessage, ['@user', '0']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('durée valide'),
      })
    );
  });

  test('devrait refuser si durée > 60', async () => {
    await muteCommand.execute(mockMessage, ['@user', '61']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('60 minutes')
    );
  });

  test('devrait refuser si utilisateur pas en vocal', async () => {
    mockMentionedMember.voice.channel = null;

    await muteCommand.execute(mockMessage, ['@user', '5']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('pas dans un salon vocal')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test.todo('devrait accepter une durée valide - TODO: nécessite mock complet de voice.setMute et setTimeout');

  // ========================================
  // TESTS DE GESTION D'ERREUR
  // ========================================

  test.todo('devrait gérer les erreurs gracieusement - TODO: nécessite un mock plus complexe');
});

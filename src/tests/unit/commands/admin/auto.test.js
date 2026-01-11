/**
 * Tests unitaires pour la commande auto (admin)
 */

const autoCommand = require('../../../../commands/admin/auto');

describe('Auto Command', () => {
  let mockMessage;
  let mockMember;

  beforeEach(() => {
    mockMember = {
      permissions: {
        has: jest.fn(() => true), // Par défaut, a les permissions
      },
    };

    mockMessage = {
      author: { username: 'AdminUser', id: '123456789' },
      member: mockMember,
      channel: { id: 'channel123' },
      reply: jest.fn().mockResolvedValue(undefined),
    };

    // Nettoyer les intervalles actifs avant chaque test
    jest.clearAllTimers();
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
    expect(autoCommand).toHaveProperty('name');
    expect(autoCommand).toHaveProperty('description');
    expect(autoCommand).toHaveProperty('usage');
    expect(autoCommand).toHaveProperty('execute');
    expect(autoCommand.name).toBe('auto');
  });

  // ========================================
  // TESTS DE PERMISSIONS
  // ========================================

  test('devrait refuser si pas administrateur', async () => {
    mockMember.permissions.has = jest.fn(() => false);

    await autoCommand.execute(mockMessage, ['60', 'test']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('administrateur')
    );
  });

  // ========================================
  // TESTS FONCTIONNELS
  // ========================================

  test('devrait refuser si arguments insuffisants', async () => {
    await autoCommand.execute(mockMessage, ['60']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Utilisation incorrecte'),
      })
    );
  });

  test('devrait refuser si temps invalide', async () => {
    await autoCommand.execute(mockMessage, ['invalid', 'message']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('nombre')
    );
  });

  test('devrait refuser si temps trop court', async () => {
    await autoCommand.execute(mockMessage, ['4', 'message']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('10 secondes')
    );
  });

  test('devrait refuser si temps trop long', async () => {
    await autoCommand.execute(mockMessage, ['3601', 'message']);

    expect(mockMessage.reply).toHaveBeenCalledWith(
      expect.stringContaining('maximum')
    );
  });

  test('devrait arrêter le message automatique avec "stop"', async () => {
    // Simuler qu'un interval est actif (sera testé dans l'implémentation réelle)
    await autoCommand.execute(mockMessage, ['stop']);

    expect(mockMessage.reply).toHaveBeenCalled();
  });

  // ========================================
  // TESTS DE GESTION D'ERREUR
  // ========================================

  test('devrait gérer les erreurs gracieusement', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const testMessage = {
      member: { permissions: { has: jest.fn(() => true) } },
      channel: { id: 'test' },
      reply: jest.fn()
        .mockRejectedValueOnce(new Error('Test'))
        .mockResolvedValueOnce(undefined),
    };

    await autoCommand.execute(testMessage, ['60', 'message']);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

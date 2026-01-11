/**
 * Tests unitaires pour la commande coin
 */

const coinCommand = require('../../../../commands/fun/coin');

describe('Coin Command', () => {
  let mockMessage;
  let randomSpy;

  beforeEach(() => {
    mockMessage = {
      author: { username: 'TestUser', id: '123456789' },
      reply: jest.fn().mockResolvedValue(undefined),
    };

    randomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    if (randomSpy) {
      randomSpy.mockRestore();
    }
    jest.clearAllMocks();
  });

  test('devrait avoir les propriétés requises', () => {
    expect(coinCommand).toHaveProperty('name');
    expect(coinCommand).toHaveProperty('description');
    expect(coinCommand).toHaveProperty('execute');
    expect(coinCommand.name).toBe('coin');
  });

  test('devrait retourner Pile', async () => {
    randomSpy.mockReturnValue(0.0);

    await coinCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.description).toContain('Pile');
    expect(embed.data.description).toContain('🪙');
    expect(embed.data.color).toBe(0xffd700); // Or
  });

  test('devrait retourner Face', async () => {
    randomSpy.mockReturnValue(0.99);

    await coinCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toContain('Face');
    expect(embed.data.description).toContain('💰');
    expect(embed.data.color).toBe(0xc0c0c0); // Argent
  });

  test('devrait avoir le titre correct', async () => {
    randomSpy.mockReturnValue(0.5);

    await coinCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('🎲 Lancer de Pièce');
  });

  test('devrait gérer les erreurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const testMessage = {
      author: { username: 'TestUser' },
      reply: jest.fn().mockRejectedValueOnce(new Error('Test')).mockResolvedValueOnce(undefined),
    };

    await coinCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

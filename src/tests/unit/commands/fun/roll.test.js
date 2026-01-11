/**
 * Tests unitaires pour la commande roll
 */

const rollCommand = require('../../../../commands/fun/roll');

describe('Roll Command', () => {
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
    expect(rollCommand).toHaveProperty('name');
    expect(rollCommand).toHaveProperty('description');
    expect(rollCommand).toHaveProperty('execute');
    expect(rollCommand.name).toBe('roll');
  });

  test('devrait retourner 1 (nombre minimum)', async () => {
    randomSpy.mockReturnValue(0.0);

    await rollCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.description).toContain('**1**');
    expect(embed.data.color).toBe(0xff0000); // Rouge
  });

  test('devrait retourner 100 (nombre maximum)', async () => {
    randomSpy.mockReturnValue(0.99);

    await rollCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toContain('**100**');
    expect(embed.data.color).toBe(0x00ff00); // Vert
  });

  test('devrait retourner une couleur verte pour 90+', async () => {
    randomSpy.mockReturnValue(0.9);

    await rollCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.color).toBe(0x00ff00);
  });

  test('devrait retourner une couleur jaune pour 50-89', async () => {
    randomSpy.mockReturnValue(0.5);

    await rollCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.color).toBe(0xffff00);
  });

  test('devrait retourner une couleur rouge pour 1-49', async () => {
    randomSpy.mockReturnValue(0.1);

    await rollCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.color).toBe(0xff0000);
  });

  test('devrait gérer les erreurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const testMessage = {
      author: { username: 'TestUser' },
      reply: jest.fn().mockRejectedValueOnce(new Error('Test')).mockResolvedValueOnce(undefined),
    };

    await rollCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

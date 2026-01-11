/**
 * Tests unitaires pour la commande wifi
 */

const wifiCommand = require('../../../../commands/fun/wifi');

describe('Wifi Command', () => {
  let mockMessage;
  let randomSpy;

  beforeEach(() => {
    mockMessage = {
      author: { username: 'TestUser', id: '123456789' },
      reply: jest.fn().mockResolvedValue(undefined),
      mentions: { users: { first: jest.fn(() => null) } },
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
    expect(wifiCommand).toHaveProperty('name');
    expect(wifiCommand).toHaveProperty('description');
    expect(wifiCommand).toHaveProperty('execute');
    expect(wifiCommand.name).toBe('wifi');
  });

  test('devrait sélectionner un état de connexion selon les probabilités', async () => {
    randomSpy.mockReturnValue(0.01);

    await wifiCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.title).toBe('📶 Qualité de Connexion');
    expect(embed.data.description).toMatch(/\d+ ms|∞/);
  });

  test('devrait afficher l\'utilisateur mentionné', async () => {
    mockMessage.mentions.users.first = jest.fn(() => ({ username: 'TargetUser' }));
    randomSpy.mockReturnValue(0.01);

    await wifiCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toContain('TargetUser');
  });

  test('devrait gérer les erreurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const testMessage = {
      author: { username: 'TestUser' },
      mentions: { users: { first: jest.fn(() => null) } },
      reply: jest.fn().mockRejectedValueOnce(new Error('Test')).mockResolvedValueOnce(undefined),
    };

    await wifiCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

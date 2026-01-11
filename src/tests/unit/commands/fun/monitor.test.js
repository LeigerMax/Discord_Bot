/**
 * Tests unitaires pour la commande monitor
 */

const monitorCommand = require('../../../../commands/fun/monitor');

describe('Monitor Command', () => {
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
    expect(monitorCommand).toHaveProperty('name');
    expect(monitorCommand).toHaveProperty('description');
    expect(monitorCommand).toHaveProperty('execute');
    expect(monitorCommand.name).toBe('monitor');
  });

  test('devrait sélectionner un état d\'écran selon les probabilités', async () => {
    randomSpy.mockReturnValue(0.01);

    await monitorCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.title).toBe('🖥️ État de l\'Écran');
    expect(embed.data.description).toMatch(/Écran nickel|Trace de doigt|Fissure|fissuré|explosé|KO/);
  });

  test('devrait afficher l\'utilisateur mentionné', async () => {
    mockMessage.mentions.users.first = jest.fn(() => ({ username: 'TargetUser' }));
    randomSpy.mockReturnValue(0.01);

    await monitorCommand.execute(mockMessage, []);

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

    await monitorCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

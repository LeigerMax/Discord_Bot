/**
 * Tests unitaires pour la commande rage
 */

const rageCommand = require('../../../../commands/fun/rage');

describe('Rage Command', () => {
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
    expect(rageCommand).toHaveProperty('name');
    expect(rageCommand).toHaveProperty('description');
    expect(rageCommand).toHaveProperty('execute');
    expect(rageCommand.name).toBe('rage');
  });

  test('devrait générer un niveau de rage entre 0 et 100', async () => {
    randomSpy.mockReturnValue(0.5);

    await rageCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.description).toMatch(/\d+%/);
  });

  test('devrait afficher l\'utilisateur mentionné', async () => {
    mockMessage.mentions.users.first = jest.fn(() => ({ username: 'TargetUser' }));
    randomSpy.mockReturnValue(0.5);

    await rageCommand.execute(mockMessage, []);

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

    await rageCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

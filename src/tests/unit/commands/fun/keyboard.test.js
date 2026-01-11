/**
 * Tests unitaires pour la commande keyboard
 */

const keyboardCommand = require('../../../../commands/fun/keyboard');

describe('Keyboard Command', () => {
  let mockMessage;
  let mockUserMention;
  let randomSpy;

  beforeEach(() => {
    mockUserMention = {
      id: '987654321',
      username: 'MentionedUser',
    };

    mockMessage = {
      author: { username: 'TestUser', id: '123456789' },
      reply: jest.fn().mockResolvedValue(undefined),
      mentions: {
        users: {
          first: jest.fn(() => null),
        },
      },
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
    expect(keyboardCommand).toHaveProperty('name');
    expect(keyboardCommand).toHaveProperty('description');
    expect(keyboardCommand).toHaveProperty('execute');
    expect(keyboardCommand.name).toBe('keyboard');
  });

  test('devrait vérifier le clavier de l\'auteur si aucune mention', async () => {
    randomSpy.mockReturnValue(0.01);

    await keyboardCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];

    expect(embed.data.title).toBe('⌨️ État du Clavier');
    expect(embed.data.description).toContain('TestUser');
  });

  test('devrait vérifier le clavier de l\'utilisateur mentionné', async () => {
    mockMessage.mentions.users.first = jest.fn(() => mockUserMention);
    randomSpy.mockReturnValue(0.01);

    await keyboardCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toContain('MentionedUser');
  });

  test('devrait sélectionner un état selon les probabilités', async () => {
    randomSpy.mockReturnValue(0.01);

    await keyboardCommand.execute(mockMessage, []);

    const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
    expect(embed.data.description).toMatch(/Clavier intact|Touches collantes|touches arrachées|Barre espace|feu|détruit/);
  });

  test('devrait gérer les erreurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const testMessage = {
      author: { username: 'TestUser' },
      mentions: { users: { first: jest.fn(() => null) } },
      reply: jest.fn().mockRejectedValueOnce(new Error('Test')).mockResolvedValueOnce(undefined),
    };

    await keyboardCommand.execute(testMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

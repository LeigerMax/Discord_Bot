/**
 * Tests unitaires pour la commande random
 */

const randomCommand = require('../../../../commands/fun/random');

describe('Random Command', () => {
  let mockMessage;
  let randomSpy;

  beforeEach(() => {
    mockMessage = {
      author: { username: 'TestUser' },
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
    expect(randomCommand).toHaveProperty('name');
    expect(randomCommand).toHaveProperty('description');
    expect(randomCommand).toHaveProperty('execute');
    expect(randomCommand.name).toBe('random');
  });

  test('devrait retourner une erreur si moins de 2 options', () => {
    randomCommand.execute(mockMessage, ['option1']);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    expect(mockMessage.reply.mock.calls[0][0].content).toContain('au moins 2 options');
  });

  test('devrait choisir une option parmi les arguments', () => {
    randomSpy.mockReturnValue(0.0);

    randomCommand.execute(mockMessage, ['option1', 'option2', 'option3']);

    expect(mockMessage.reply).toHaveBeenCalledTimes(1);
    expect(mockMessage.reply.mock.calls[0][0].content).toContain('option1');
  });

  test('devrait refuser plus de 25 options', () => {
    const manyOptions = Array.from({ length: 26 }, (_, i) => `option${i}`);

    randomCommand.execute(mockMessage, manyOptions);

    expect(mockMessage.reply.mock.calls[0][0]).toContain('Maximum 25 options');
  });

  test('devrait gérer les erreurs', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Forcer une erreur en passant un objet invalide
    const invalidMessage = null;
    
    expect(() => {
      randomCommand.execute(invalidMessage, ['opt1', 'opt2']);
    }).toThrow();

    consoleErrorSpy.mockRestore();
  });
});

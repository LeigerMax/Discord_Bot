/**
 * @file Tests pour cursedMessages.js
 * @description Tests unitaires pour le système de messages maudits
 */

describe('Event: cursedMessages', () => {
  let mockClient, mockMessage, mockChannel, mockCommandHandler, mockCurseCommand;
  let messageCreateHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockChannel = {
      send: jest.fn().mockResolvedValue({})
    };

    mockMessage = {
      author: {
        id: 'user-123',
        username: 'TestUser',
        bot: false
      },
      content: 'test message',
      channel: mockChannel,
      delete: jest.fn().mockResolvedValue({})
    };

    mockCurseCommand = {
      isCursed: jest.fn().mockReturnValue(false),
      getCurseType: jest.fn().mockReturnValue(null)
    };

    mockCommandHandler = {
      commands: new Map([
        ['curse', mockCurseCommand]
      ])
    };

    mockClient = {
      on: jest.fn((event, handler) => {
        if (event === 'messageCreate') {
          messageCreateHandler = handler;
        }
      }),
      commandHandler: mockCommandHandler
    };

    const cursedMessagesModule = require('../../../events/cursedMessages.js');
    cursedMessagesModule(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Filtres de base', () => {
    test('doit ignorer les messages de bots', async () => {
      mockMessage.author.bot = true;

      await messageCreateHandler(mockMessage);

      expect(mockCurseCommand.isCursed).not.toHaveBeenCalled();
      expect(mockMessage.delete).not.toHaveBeenCalled();
    });

    test('doit ignorer les commandes (messages commençant par !)', async () => {
      mockMessage.content = '!help';

      await messageCreateHandler(mockMessage);

      expect(mockCurseCommand.isCursed).not.toHaveBeenCalled();
      expect(mockMessage.delete).not.toHaveBeenCalled();
    });

    test('doit ignorer si commandHandler n\'existe pas', async () => {
      mockClient.commandHandler = null;

      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).not.toHaveBeenCalled();
    });

    test('doit ignorer si curse command n\'existe pas', async () => {
      mockCommandHandler.commands = new Map();

      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).not.toHaveBeenCalled();
    });

    test('doit ignorer si utilisateur non maudit', async () => {
      mockCurseCommand.isCursed.mockReturnValue(false);

      await messageCreateHandler(mockMessage);

      expect(mockCurseCommand.isCursed).toHaveBeenCalledWith('user-123');
      expect(mockMessage.delete).not.toHaveBeenCalled();
    });

    test('doit ignorer les malédictions non altérantes', async () => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('OTHER_CURSE');

      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).not.toHaveBeenCalled();
    });
  });

  describe('MESSAGE_SCRAMBLER', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('MESSAGE_SCRAMBLER');
      mockMessage.content = 'hello world test';
    });

    test('doit mélanger l\'ordre des mots', async () => {
      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(mockChannel.send).toHaveBeenCalled();

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('**TestUser** a dit :');
      
      // Le message doit contenir les mêmes mots mais dans un ordre différent
      const originalWords = mockMessage.content.split(' ').sort();
      const scrambledText = sentMessage.split(' : ')[1];
      const scrambledWords = scrambledText.split(' ').sort();
      
      expect(scrambledWords).toEqual(originalWords);
    });

    test('doit gérer un message d\'un seul mot', async () => {
      mockMessage.content = 'hello';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(mockChannel.send).toHaveBeenCalled();
      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('hello');
    });
  });

  describe('MESSAGE_OPPOSER', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('MESSAGE_OPPOSER');
    });

    test('doit traiter le message', async () => {
      mockMessage.content = 'je vais bien';

      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
      expect(mockMessage.delete).toHaveBeenCalled();
    });

    test('doit altérer le message', async () => {
      mockMessage.content = 'test message';

      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(mockChannel.send).toHaveBeenCalled();
      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('**TestUser**');
    });
  });

  describe('CLOWN_MODE', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('CLOWN_MODE');
    });

    test('doit ajouter des emojis clown', async () => {
      mockMessage.content = 'hello world';

      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('🤡');
      expect((sentMessage.match(/🤡/g) || []).length).toBeGreaterThanOrEqual(2);
    });

    test('doit ajouter un emoji par mot', async () => {
      mockMessage.content = 'a b c';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect((sentMessage.match(/🤡/g) || []).length).toBe(3);
    });
  });

  describe('UWU_MODE', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('UWU_MODE');
    });

    test('doit transformer le texte', async () => {
      mockMessage.content = 'hello world';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toMatch(/w/);
      expect(mockMessage.delete).toHaveBeenCalled();
    });

    test('doit envoyer le message altéré', async () => {
      mockMessage.content = 'test';

      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('**TestUser**');
    });

    test('doit transformer "love" en "luv"', async () => {
      mockMessage.content = 'I love this';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('uv');
    });
  });

  describe('YODA_MODE', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('YODA_MODE');
    });

    test('doit inverser l\'ordre des mots', async () => {
      mockMessage.content = 'hello world test';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      const alteredText = sentMessage.split(' : ')[1];
      expect(alteredText.split(' ')[0]).toBe('test');
    });

    test('doit gérer les messages courts', async () => {
      mockMessage.content = 'hi';

      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('hi');
    });
  });

  describe('CAPS_LOCK', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('CAPS_LOCK');
    });

    test('doit mettre en majuscules et ajouter des points d\'exclamation', async () => {
      mockMessage.content = 'hello world';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('HELLO WORLD!!!!');
    });

    test('doit gérer les majuscules existantes', async () => {
      mockMessage.content = 'HELLO';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('HELLO!!!!');
    });
  });

  describe('PIRATE_MODE', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('PIRATE_MODE');
    });

    test('doit transformer en langage pirate', async () => {
      mockMessage.content = 'bonjour';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('ahoy');
    });

    test('doit ajouter une expression pirate à la fin', async () => {
      mockMessage.content = 'test';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toMatch(/(arr|moussaillon|Neptune|sacrebleu)/);
    });

    test('doit remplacer "oui" par "aye"', async () => {
      mockMessage.content = 'oui';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('aye');
    });
  });

  describe('VOWEL_REMOVER', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('VOWEL_REMOVER');
    });

    test('doit retirer toutes les voyelles', async () => {
      mockMessage.content = 'hello world';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      const alteredText = sentMessage.split(' : ')[1];
      expect(alteredText).not.toMatch(/[aeiouy]/i);
    });

    test('doit gérer un texte avec que des voyelles', async () => {
      mockMessage.content = 'aaa';

      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
    });

    test('doit garder les consonnes', async () => {
      mockMessage.content = 'bcdfg';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('bcdfg');
    });
  });

  describe('REVERSE_TEXT', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('REVERSE_TEXT');
    });

    test('doit inverser le texte', async () => {
      mockMessage.content = 'hello';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('olleh');
    });

    test('doit gérer les espaces', async () => {
      mockMessage.content = 'ab cd';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('dc ba');
    });
  });

  describe('RANDOM_EMOJI', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('RANDOM_EMOJI');
    });

    test('doit remplacer "manger" par un emoji', async () => {
      mockMessage.content = 'je vais manger';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('🍕');
    });

    test('doit remplacer "content" par un emoji', async () => {
      mockMessage.content = 'je suis content';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('😊');
    });

    test('doit gérer les mots non mappés', async () => {
      mockMessage.content = 'xyz';

      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('xyz');
    });
  });

  describe('Gestion des erreurs', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('CAPS_LOCK');
    });

    test('doit gérer l\'erreur de suppression', async () => {
      mockMessage.delete.mockRejectedValue(new Error('Cannot delete'));

      await messageCreateHandler(mockMessage);

      // Ne doit pas crash
      expect(mockChannel.send).toHaveBeenCalled();
    });

    test('doit gérer l\'erreur d\'envoi', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockChannel.send.mockRejectedValue(new Error('Cannot send'));

      await messageCreateHandler(mockMessage);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur dans cursedMessages:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    test('doit gérer les erreurs dans le handler', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCurseCommand.getCurseType.mockImplementation(() => {
        throw new Error('Test error');
      });

      await messageCreateHandler(mockMessage);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Format du message', () => {
    beforeEach(() => {
      mockCurseCommand.isCursed.mockReturnValue(true);
      mockCurseCommand.getCurseType.mockReturnValue('CAPS_LOCK');
    });

    test('doit inclure le nom d\'utilisateur', async () => {
      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('**TestUser**');
    });

    test('doit inclure "a dit :"', async () => {
      await messageCreateHandler(mockMessage);

      const sentMessage = mockChannel.send.mock.calls[0][0];
      expect(sentMessage).toContain('a dit :');
    });

    test('doit supprimer le message original', async () => {
      await messageCreateHandler(mockMessage);

      expect(mockMessage.delete).toHaveBeenCalled();
    });

    test('doit envoyer dans le même channel', async () => {
      await messageCreateHandler(mockMessage);

      expect(mockChannel.send).toHaveBeenCalled();
    });
  });
});

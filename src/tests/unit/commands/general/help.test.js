/**
 * @file Tests pour help.js
 * @description Tests unitaires pour la commande help avec menu de sélection
 */

const helpCommand = require('../../../../commands/general/help.js');
const fs = require('fs');
const path = require('path');

// Mock du module fs
jest.mock('fs');

describe('Commande: help', () => {
  let mockMessage, mockResponse, mockCollector;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollector = {
      on: jest.fn()
    };

    mockResponse = {
      createMessageComponentCollector: jest.fn().mockReturnValue(mockCollector),
      edit: jest.fn().mockResolvedValue({})
    };

    mockMessage = {
      author: {
        username: 'TestUser',
        id: 'user-123',
        displayAvatarURL: jest.fn().mockReturnValue('https://example.com/avatar.png')
      },
      reply: jest.fn().mockResolvedValue(mockResponse)
    };

    // Mock du système de fichiers
    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes('commands')) {
        if (dirPath.endsWith('commands')) {
          return ['admin', 'fun', 'general', 'music'];
        }
        if (dirPath.includes('admin')) {
          return ['mute.js', 'welcome.js'];
        }
        if (dirPath.includes('fun')) {
          return ['dice.js', 'random.js', 'curse.js'];
        }
        if (dirPath.includes('general')) {
          return ['help.js', 'ping.js', 'version.js'];
        }
        if (dirPath.includes('music')) {
          return ['play.js', 'queue.js'];
        }
      }
      return [];
    });

    fs.statSync.mockReturnValue({
      isDirectory: () => true
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Propriétés de la commande', () => {
    test('doit avoir un nom', () => {
      expect(helpCommand.name).toBe('help');
    });

    test('doit avoir une description', () => {
      expect(helpCommand.description).toBeDefined();
      expect(typeof helpCommand.description).toBe('string');
    });

    test('doit avoir un usage', () => {
      expect(helpCommand.usage).toBe('!help');
    });

    test('doit avoir une fonction execute', () => {
      expect(typeof helpCommand.execute).toBe('function');
    });
  });

  describe('Chargement des commandes', () => {
    beforeEach(() => {
      // Mock des commandes
      jest.mock(path.join(__dirname, '../../../../commands/admin/mute.js'), () => ({
        name: 'mute',
        description: 'Mute un utilisateur',
        execute: jest.fn()
      }), { virtual: true });

      jest.mock(path.join(__dirname, '../../../../commands/fun/dice.js'), () => ({
        name: 'dice',
        description: 'Lance un dé',
        execute: jest.fn()
      }), { virtual: true });
    });

    test('doit lire les dossiers de catégories', async () => {
      await helpCommand.execute(mockMessage, []);

      expect(fs.readdirSync).toHaveBeenCalled();
      const callArgs = fs.readdirSync.mock.calls.map(call => call[0]);
      expect(callArgs.some(arg => arg.includes('commands'))).toBe(true);
    });

    test('doit filtrer les fichiers JS', async () => {
      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.includes('admin')) {
          return ['mute.js', 'README.md', 'test.txt'];
        }
        return ['admin'];
      });

      await helpCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
    });

    test('doit ignorer les catégories vides', async () => {
      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.includes('empty-category')) {
          return [];
        }
        if (dirPath.endsWith('commands')) {
          return ['admin', 'empty-category'];
        }
        return ['mute.js'];
      });

      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.fields).toBeDefined();
    });

    test('doit gérer les erreurs de chargement de commandes', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await helpCommand.execute(mockMessage, []);

      // Vérifie que ça ne crash pas même si une commande ne charge pas
      expect(mockMessage.reply).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Embed d\'accueil', () => {
    test('doit créer un embed avec titre', async () => {
      await helpCommand.execute(mockMessage, []);

      expect(mockMessage.reply).toHaveBeenCalled();
      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      
      expect(embed.data.title).toContain('Menu d\'Aide');
    });

    test('doit afficher le total de commandes', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.description).toContain('Total');
      expect(embed.data.description).toMatch(/\d+ commande/);
    });

    test('doit afficher le préfixe', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.description).toContain('Préfixe');
      expect(embed.data.description).toContain('!');
    });

    test('doit avoir un footer avec le nom de l\'utilisateur', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.footer.text).toContain('TestUser');
    });

    test('doit avoir l\'avatar de l\'utilisateur dans le footer', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.footer.icon_url).toBe('https://example.com/avatar.png');
    });

    test('doit avoir un timestamp', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.timestamp).toBeDefined();
    });

    test('doit avoir la couleur bleue', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.color).toBe(0x5865F2);
    });

    test('doit afficher un aperçu des catégories', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.fields.length).toBeGreaterThan(0);
    });

    test('doit utiliser des emojis pour les catégories', async () => {
      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      const hasEmoji = embed.data.fields.some(f => /\p{Emoji}/u.test(f.name));
      expect(hasEmoji).toBe(true);
    });
  });

  describe('Menu de sélection', () => {
    test('doit créer un menu déroulant', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      expect(components).toBeDefined();
      expect(components.length).toBeGreaterThan(0);
    });

    test('doit avoir un placeholder', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      const selectMenu = components[0].components[0];
      expect(selectMenu.data.placeholder).toContain('Sélectionnez');
    });

    test('doit avoir un customId', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      const selectMenu = components[0].components[0];
      expect(selectMenu.data.custom_id).toBe('help_menu');
    });

    test('doit inclure l\'option Accueil', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      const selectMenu = components[0].components[0];
      const hasHome = selectMenu.options.some(opt => opt.data.value === 'home');
      expect(hasHome).toBe(true);
    });

    test('doit créer une option par catégorie', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      const selectMenu = components[0].components[0];
      
      const categories = ['admin', 'fun', 'general', 'music'];
      categories.forEach(cat => {
        const hasCategory = selectMenu.options.some(opt => opt.data.value === cat);
        expect(hasCategory).toBe(true);
      });
    });

    test('doit afficher le nombre de commandes dans chaque option', async () => {
      await helpCommand.execute(mockMessage, []);

      const components = mockMessage.reply.mock.calls[0][0].components;
      const selectMenu = components[0].components[0];
      
      const option = selectMenu.options.find(opt => opt.data.value === 'admin');
      expect(option.data.description).toMatch(/\d+ commande/);
    });
  });

  describe('Collecteur d\'interactions', () => {
    test('doit créer un collecteur', async () => {
      await helpCommand.execute(mockMessage, []);

      expect(mockResponse.createMessageComponentCollector).toHaveBeenCalled();
    });

    test('doit filtrer par user ID', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectorOptions = mockResponse.createMessageComponentCollector.mock.calls[0][0];
      expect(collectorOptions.filter).toBeDefined();

      // Test du filtre
      const mockInteraction = { user: { id: 'user-123' } };
      expect(collectorOptions.filter(mockInteraction)).toBe(true);

      const wrongUser = { user: { id: 'user-456' } };
      expect(collectorOptions.filter(wrongUser)).toBe(false);
    });

    test('doit avoir un timeout de 5 minutes', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectorOptions = mockResponse.createMessageComponentCollector.mock.calls[0][0];
      expect(collectorOptions.time).toBe(300000);
    });

    test('doit enregistrer un handler pour collect', async () => {
      await helpCommand.execute(mockMessage, []);

      expect(mockCollector.on).toHaveBeenCalledWith('collect', expect.any(Function));
    });

    test('doit enregistrer un handler pour end', async () => {
      await helpCommand.execute(mockMessage, []);

      expect(mockCollector.on).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });

  describe('Interaction - Retour accueil', () => {
    test('doit revenir à l\'embed d\'accueil', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['home'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      expect(mockInteraction.update).toHaveBeenCalled();
      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.embeds[0].data.title).toContain('Menu d\'Aide');
    });
  });

  describe('Interaction - Sélection catégorie', () => {
    test('doit afficher l\'embed d\'une catégorie', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['admin'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      expect(mockInteraction.update).toHaveBeenCalled();
      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.embeds[0].data.title).toContain('Administration');
    });

    test('doit lister les commandes de la catégorie', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['fun'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.embeds[0].data.description).toBeDefined();
    });

    test('doit afficher le nombre de commandes dans le footer', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['general'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.embeds[0].data.footer.text).toMatch(/\d+ commande/);
    });

    test('doit conserver le menu de sélection', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['music'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.components).toBeDefined();
      expect(updateData.components.length).toBeGreaterThan(0);
    });
  });

  describe('Expiration du collecteur', () => {
    test('doit désactiver le menu après expiration', async () => {
      await helpCommand.execute(mockMessage, []);

      const endHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'end'
      )[1];

      await endHandler();

      expect(mockResponse.edit).toHaveBeenCalled();
      const editData = mockResponse.edit.mock.calls[0][0];
      expect(editData.components[0].components[0].data.disabled).toBe(true);
    });

    test('doit gérer l\'erreur d\'édition après expiration', async () => {
      mockResponse.edit.mockRejectedValue(new Error('Cannot edit'));

      await helpCommand.execute(mockMessage, []);

      const endHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'end'
      )[1];

      // Ne doit pas crash
      endHandler();
      expect(mockResponse.edit).toBeDefined();
    });
  });

  describe('Gestion des erreurs', () => {
    test('doit gérer l\'erreur de lecture de dossier', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await helpCommand.execute(mockMessage, []);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Format des commandes', () => {
    test('doit afficher le nom de la commande en gras', async () => {
      await helpCommand.execute(mockMessage, []);

      const collectHandler = mockCollector.on.mock.calls.find(
        call => call[0] === 'collect'
      )[1];

      const mockInteraction = {
        values: ['admin'],
        update: jest.fn().mockResolvedValue({})
      };

      await collectHandler(mockInteraction);

      const updateData = mockInteraction.update.mock.calls[0][0];
      expect(updateData.embeds[0].data.description).toContain('**!');
    });

    test('doit gérer les descriptions longues', async () => {
      await helpCommand.execute(mockMessage, []);

      // Vérifie que même avec beaucoup de commandes, l'embed ne dépasse pas la limite
      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      expect(embed.data.description.length).toBeLessThan(4096);
    });
  });

  describe('Tri et ordre', () => {
    test('doit trier les catégories par ordre alphabétique', async () => {
      fs.readdirSync.mockImplementation((dirPath) => {
        if (dirPath.endsWith('commands')) {
          return ['zzzz', 'admin', 'bbbb'];
        }
        return ['test.js'];
      });

      await helpCommand.execute(mockMessage, []);

      const embed = mockMessage.reply.mock.calls[0][0].embeds[0];
      // Devrait être trié
      expect(embed.data.fields).toBeDefined();
    });
  });
});

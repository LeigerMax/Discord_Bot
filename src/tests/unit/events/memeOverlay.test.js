/**
 * @file Tests unitaires pour l'event memeOverlay
 */

const { io } = require('socket.io-client');

// Mock de socket.io-client
jest.mock('socket.io-client', () => {
  const emitMock = jest.fn();
  const onMock = jest.fn();
  return {
    io: jest.fn(() => ({
      emit: emitMock,
      on: onMock,
      disconnect: jest.fn()
    }))
  };
});

// Mock de la configuration botConfig.json
jest.mock('../../../../src/config/botConfig.json', () => ({
  memeOverlay: {
    enabled: true,
    channelId: 'targetChannelId',
    serverUrl: 'http://mock-socket-server'
  }
}), { virtual: true });

// Mock de storageService
jest.mock('../../../../src/services/storageService', () => ({
  get: jest.fn(),
  set: jest.fn()
}), { virtual: true });

const storageService = require('../../../../src/services/storageService');
const memeOverlayModule = require('../../../events/memeOverlay');

describe('MemeOverlay Event', () => {
  let mockClient;
  let messageCreateHandler;
  let mockMessage;
  let socketMock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Par défaut, pas de config sur le serveur (fallback sur la config globale)
    storageService.get.mockReturnValue(null);

    mockClient = {
      on: jest.fn((event, handler) => {
        if (event === 'messageCreate') messageCreateHandler = handler;
      }),
    };

    // Initialise le module
    memeOverlayModule(mockClient);

    socketMock = io();

    // Mock des pièces jointes sous forme de Collection (Map avec find)
    const attachmentsMap = new Map();
    attachmentsMap.find = function(fn) {
      for (const [key, val] of this.entries()) {
        if (fn(val, key, this)) return val;
      }
      return undefined;
    };
    
    mockMessage = {
      id: 'msg123',
      author: {
        id: 'user123',
        username: 'TestUser',
        tag: 'TestUser#1234',
        bot: false,
      },
      content: 'Regardez ce mème !',
      attachments: attachmentsMap,
      channel: { id: 'targetChannelId', name: 'memes' },
      guild: { id: 'guild1', name: 'Server' },
      createdAt: new Date(),
    };
  });

  test('devrait ignorer les messages sans pièces jointes', async () => {
    await messageCreateHandler(mockMessage);
    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test('devrait ignorer les messages des bots', async () => {
    mockMessage.author.bot = true;
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.png',
      name: 'meme.png',
      contentType: 'image/png'
    });

    await messageCreateHandler(mockMessage);
    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test('devrait ignorer les messages provenant d\'un salon non configuré', async () => {
    mockMessage.channel.id = 'otherChannelId';
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.png',
      name: 'meme.png',
      contentType: 'image/png'
    });

    await messageCreateHandler(mockMessage);
    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test('devrait ignorer les pièces jointes qui ne sont pas des images', async () => {
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/document.pdf',
      name: 'document.pdf',
      contentType: 'application/pdf'
    });

    await messageCreateHandler(mockMessage);
    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test('devrait émettre diffuser_meme quand toutes les conditions globales sont remplies (fallback)', async () => {
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.jpg',
      name: 'meme.jpg',
      contentType: 'image/jpeg'
    });

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).toHaveBeenCalledWith('diffuser_meme', expect.objectContaining({
      url: 'http://example.com/meme.jpg',
      text: 'Regardez ce mème !',
      author: 'TestUser#1234'
    }));
  });

  test('devrait détecter l\'image via l\'extension de fichier si le contentType est absent', async () => {
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.webp',
      name: 'meme.webp',
      contentType: undefined
    });

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).toHaveBeenCalledWith('diffuser_meme', expect.objectContaining({
      url: 'http://example.com/meme.webp',
      text: 'Regardez ce mème !',
      author: 'TestUser#1234'
    }));
  });

  test('devrait utiliser la configuration spécifique au serveur (storageService) si présente', async () => {
    // Le serveur a configuré le salon 'dashboardChannelId' et l'activation à true
    storageService.get.mockReturnValue({
      memeOverlay: {
        enabled: true,
        channelId: 'dashboardChannelId'
      }
    });

    mockMessage.channel.id = 'dashboardChannelId';
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.jpg',
      name: 'meme.jpg',
      contentType: 'image/jpeg'
    });

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).toHaveBeenCalledWith('diffuser_meme', expect.objectContaining({
      url: 'http://example.com/meme.jpg',
      text: 'Regardez ce mème !',
      author: 'TestUser#1234'
    }));
  });

  test('devrait ignorer le message si la configuration spécifique au serveur désactive la fonctionnalité', async () => {
    // Le serveur a désactivé la fonctionnalité via le dashboard
    storageService.get.mockReturnValue({
      memeOverlay: {
        enabled: false,
        channelId: 'targetChannelId'
      }
    });

    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.jpg',
      name: 'meme.jpg',
      contentType: 'image/jpeg'
    });

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).not.toHaveBeenCalled();
  });

  test('devrait émettre diffuser_meme quand le message contient uniquement une pièce jointe et aucun texte', async () => {
    mockMessage.content = '';
    mockMessage.attachments.set('att1', {
      url: 'http://example.com/meme.jpg',
      name: 'meme.jpg',
      contentType: 'image/jpeg'
    });

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).toHaveBeenCalledWith('diffuser_meme', expect.objectContaining({
      url: 'http://example.com/meme.jpg',
      text: '',
      author: 'TestUser#1234'
    }));
  });

  test('devrait émettre diffuser_meme quand le message a un lien image ou Giphy dans le contenu', async () => {
    mockMessage.content = 'Regarde https://giphy.com/gifs/funny-cat-3o7aD2saalFrP05anC';
    mockMessage.embeds = [{
      thumbnail: { url: 'https://media.giphy.com/media/3o7aD2saalFrP05anC/giphy.gif' }
    }];

    await messageCreateHandler(mockMessage);

    expect(socketMock.emit).toHaveBeenCalledWith('diffuser_meme', expect.objectContaining({
      url: 'https://media.giphy.com/media/3o7aD2saalFrP05anC/giphy.gif',
      text: 'Regarde',
      author: 'TestUser#1234'
    }));
  });
});

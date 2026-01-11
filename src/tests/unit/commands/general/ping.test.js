/**
 * Tests unitaires pour la commande ping
 */

const pingCommand = require('../../../../commands/general/ping');

describe('Ping Command', () => {
  let mockMessage;
  let mockSentMessage;

  beforeEach(() => {
    mockSentMessage = {
      createdTimestamp: 1000,
      edit: jest.fn().mockResolvedValue(undefined),
    };

    mockMessage = {
      author: { username: 'TestUser' },
      createdTimestamp: 900,
      client: {
        ws: {
          ping: 50,
        },
      },
      reply: jest.fn().mockResolvedValue(mockSentMessage),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('devrait avoir les propriétés requises', () => {
    expect(pingCommand).toHaveProperty('name');
    expect(pingCommand).toHaveProperty('description');
    expect(pingCommand).toHaveProperty('execute');
    expect(pingCommand.name).toBe('ping');
  });

  test('devrait calculer la latence du bot', async () => {
    await pingCommand.execute(mockMessage, []);

    expect(mockMessage.reply).toHaveBeenCalledWith('🏓 Calcul de la latence...');
    expect(mockSentMessage.edit).toHaveBeenCalledTimes(1);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    expect(editCall.embeds[0].data.title).toBe('🏓 Pong!');
  });

  test('devrait afficher la latence bot et API', async () => {
    await pingCommand.execute(mockMessage, []);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    const fields = editCall.embeds[0].data.fields;

    expect(fields).toHaveLength(3);
    expect(fields[0].name).toContain('Latence du Bot');
    expect(fields[1].name).toContain('Latence API');
    expect(fields[2].name).toContain('Qualité');
  });

  test('devrait afficher "Excellente" pour latence < 100ms', async () => {
    mockSentMessage.createdTimestamp = 950;

    await pingCommand.execute(mockMessage, []);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    const qualityField = editCall.embeds[0].data.fields[2];

    expect(qualityField.value).toContain('Excellente');
    expect(editCall.embeds[0].data.color).toBe(0x00ff00);
  });

  test('devrait afficher "Bonne" pour latence 100-199ms', async () => {
    mockSentMessage.createdTimestamp = 1050;

    await pingCommand.execute(mockMessage, []);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    const qualityField = editCall.embeds[0].data.fields[2];

    expect(qualityField.value).toContain('Bonne');
    expect(editCall.embeds[0].data.color).toBe(0xffff00);
  });

  test('devrait afficher "Moyenne" pour latence 200-499ms', async () => {
    mockSentMessage.createdTimestamp = 1300;

    await pingCommand.execute(mockMessage, []);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    const qualityField = editCall.embeds[0].data.fields[2];

    expect(qualityField.value).toContain('Moyenne');
    expect(editCall.embeds[0].data.color).toBe(0xff9900);
  });

  test('devrait afficher "Mauvaise" pour latence >= 500ms', async () => {
    mockSentMessage.createdTimestamp = 1500;

    await pingCommand.execute(mockMessage, []);

    const editCall = mockSentMessage.edit.mock.calls[0][0];
    const qualityField = editCall.embeds[0].data.fields[2];

    expect(qualityField.value).toContain('Mauvaise');
    expect(editCall.embeds[0].data.color).toBe(0xff0000);
  });

  test('devrait gérer les erreurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockMessage.reply.mockRejectedValueOnce(new Error('Test')).mockResolvedValueOnce(undefined);

    await pingCommand.execute(mockMessage, []);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

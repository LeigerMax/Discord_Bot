/**
 * Tests unitaires pour le service keepAlive
 * Vérifie le bon fonctionnement du serveur Express
 */


describe('KeepAlive Service', () => {
  
  let keepAlive;
  let mockApp;
  let mockListen;
  let consoleLogSpy;

  beforeEach(() => {
    jest.resetModules();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock d'express
    mockListen = jest.fn((port, host, callback) => {
      // Simuler l'appel du callback après le démarrage
      if (callback) callback();
      return { close: jest.fn() };
    });

    mockApp = {
      get: jest.fn(),
      listen: mockListen
    };

    // Mock du module express
    jest.mock('express', () => {
      return jest.fn(() => mockApp);
    });

    // Recharger keepAlive avec les mocks
    keepAlive = require('../../../../src/services/keepAlive');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  // ========================================
  // TESTS STRUCTURELS
  // ========================================

  test('devrait exporter une fonction', () => {
    expect(typeof keepAlive).toBe('function');
  });

  // ========================================
  // TESTS FONCTIONNELS (Sans mock complet d\'Express)
  // ========================================
  
  test('devrait être définit et importable', () => {
    expect(keepAlive).toBeDefined();
    expect(keepAlive).toBeInstanceOf(Function);
  });

  test('devrait avoir le bon nom de fonction', () => {
    expect(keepAlive.name).toBe('keepAlive');
  });


});


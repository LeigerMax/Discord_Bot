/**
 * Tests unitaires pour la configuration du bot (botConfig.json)
 */

const botConfig = require('../../../../src/config/botConfig.json');

describe('botConfig', () => {
  describe('Structure de la configuration', () => {
    it('devrait avoir une section presence', () => {
      expect(botConfig).toHaveProperty('presence');
      expect(typeof botConfig.presence).toBe('object');
    });

    it('devrait avoir une section about', () => {
      expect(botConfig).toHaveProperty('about');
      expect(typeof botConfig.about).toBe('object');
    });
  });

  describe('Configuration de la présence', () => {
    it('devrait avoir un status défini', () => {
      expect(botConfig.presence).toHaveProperty('status');
      expect(typeof botConfig.presence.status).toBe('string');
    });

    it('devrait avoir un status valide', () => {
      const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
      expect(validStatuses).toContain(botConfig.presence.status);
    });

    it('devrait avoir un tableau d\'activités', () => {
      expect(botConfig.presence).toHaveProperty('activities');
      expect(Array.isArray(botConfig.presence.activities)).toBe(true);
    });

    it('devrait avoir au moins une activité définie', () => {
      expect(botConfig.presence.activities.length).toBeGreaterThan(0);
    });

    it('chaque activité devrait avoir un nom', () => {
      botConfig.presence.activities.forEach(activity => {
        expect(activity).toHaveProperty('name');
        expect(typeof activity.name).toBe('string');
        expect(activity.name.length).toBeGreaterThan(0);
      });
    });

    it('chaque activité devrait avoir un type valide', () => {
      const validTypes = ['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'];
      botConfig.presence.activities.forEach(activity => {
        expect(activity).toHaveProperty('type');
        expect(validTypes).toContain(activity.type);
      });
    });
  });

  describe('Configuration "À propos"', () => {
    it('devrait avoir une description', () => {
      expect(botConfig.about).toHaveProperty('description');
      expect(typeof botConfig.about.description).toBe('string');
      expect(botConfig.about.description.length).toBeGreaterThan(0);
    });

    it('devrait avoir une liste de fonctionnalités', () => {
      expect(botConfig.about).toHaveProperty('features');
      expect(Array.isArray(botConfig.about.features)).toBe(true);
    });

    it('devrait avoir au moins une fonctionnalité listée', () => {
      expect(botConfig.about.features.length).toBeGreaterThan(0);
    });

    it('chaque fonctionnalité devrait être une chaîne non vide', () => {
      botConfig.about.features.forEach(feature => {
        expect(typeof feature).toBe('string');
        expect(feature.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Validation des données', () => {
    it('ne devrait pas contenir de valeurs undefined', () => {
      expect(botConfig.presence.status).toBeDefined();
      expect(botConfig.presence.activities).toBeDefined();
      expect(botConfig.about.description).toBeDefined();
      expect(botConfig.about.features).toBeDefined();
    });

    it('ne devrait pas contenir de valeurs null', () => {
      expect(botConfig.presence.status).not.toBeNull();
      expect(botConfig.presence.activities).not.toBeNull();
      expect(botConfig.about.description).not.toBeNull();
      expect(botConfig.about.features).not.toBeNull();
    });
  });
});

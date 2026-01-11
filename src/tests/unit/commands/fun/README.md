# Tests du dossier Fun

Ce dossier contient les tests unitaires pour les commandes du dossier `fun/`.

## 📊 État des tests

### ✅ Tests complets implémentés (11 commandes)

1. **brain** - État du cerveau (aléatoire avec états multiples)
2. **coach** - Conseils de coach gaming
3. **coin** - Pile ou Face
4. **dice** - Lancer de dé (1-6)
5. **keyboard** - État du clavier (probabilités pondérées)
6. **monitor** - État de l'écran (probabilités pondérées)
7. **rage** - Niveau de rage (0-100)
8. **random** - Choix aléatoire parmi options
9. **roll** - Lancer de nombre (1-100)
10. **wifi** - Qualité de connexion (probabilités pondérées)

### 📝 Tests TODO (10 commandes)

**Commandes GIF** (nécessitent mock de node-fetch et Giphy API):
- **hug** - GIF de câlin
- **kiss** - GIF de bisou
- **slap** - GIF de tape
- **osef** - GIF "on s'en fout"

**Commandes complexes** (nécessitent mocks Discord avancés):
- **curse** - Système de malédictions (Map storage)
- **miguel** - Statut utilisateur spécifique (guild.members, presence)
- **who** - Sélection membre vocal (voice.channel, members)
- **spam** - Spam avec nettoyage automatique (message.delete, timers)
- **roulette** - Kick aléatoire (permissions, guild.members)
- **roulettehard** - Ban aléatoire (permissions, guild.members)
- **roulettemute** - Timeout aléatoire (permissions, guild.members)

## 🎯 Patterns de test identifiés

### Pattern 1 : Commande aléatoire simple
```javascript
- Mock Math.random()
- Vérifier les différentes valeurs possibles
- Tester les edge cases (min/max)
```
**Exemples**: dice, coin, roll

### Pattern 2 : Commande avec mention optionnelle
```javascript
- Tester sans mention (utilise author)
- Tester avec mention (utilise mentioned user)
- Mock mentions.users.first()
```
**Exemples**: brain, keyboard, rage, monitor, wifi

### Pattern 3 : Commande avec sélection pondérée
```javascript
- États avec probabilités (chance)
- Sélection basée sur random
- Vérifier la logique de sélection
```
**Exemples**: keyboard, monitor, wifi

### Pattern 4 : Commande avec API externe
```javascript
- Mock node-fetch
- Mock GIPHY_API_KEY
- Tester les cas d'erreur API
```
**Exemples**: hug, kiss, slap, osef

### Pattern 5 : Commande avec interactions Discord complexes
```javascript
- Mock guild.members
- Mock voice.channel
- Mock permissions
- Mock message.delete()
```
**Exemples**: who, miguel, spam, roulettes, curse

## 🚀 Comment exécuter les tests

```bash
# Tous les tests du dossier fun
npm test -- fun

# Test spécifique
npm test -- dice.test.js

# Avec coverage
npm run test:coverage
```

## 💡 Notes d'implémentation

### Tests actuels
- Couvrent la logique métier principale
- Utilisent des mocks simples (Math.random, message.reply)
- Vérifient les structures d'embeds
- Testent la gestion d'erreurs

### Tests TODO
- Nécessitent des dépendances externes mockées
- Requièrent des mocks Discord.js avancés
- Peuvent être implémentés progressivement

## 📈 Objectif de coverage

- **Actuel**: ~50% (commandes simples)
- **Cible**: 70% (avec GIF commands)
- **Optimal**: 85% (avec commandes complexes)

## 🔧 Outils utilisés

- **Jest**: Framework de test
- **Mocks**: Math.random, message.reply, mentions
- **Assertions**: Structure embeds, contenu, couleurs
- **Spies**: console.error pour gestion d'erreurs

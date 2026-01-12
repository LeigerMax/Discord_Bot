# 🆕 Nouvelles Commandes Ajoutées

## 📋 Commandes d'Administration

### 🗑️ Clear - Suppression de messages
**Commande**: `!clear <nombre> [@utilisateur]`

Supprime des messages en masse dans le salon actuel.

**Exemples**:
- `!clear 10` - Supprime les 10 derniers messages
- `!clear 50 @User` - Supprime 50 messages de l'utilisateur mentionné

**Permissions requises**: `ManageMessages`
**Limites**: 
- Maximum 100 messages par commande
- Messages de moins de 14 jours uniquement (limitation Discord)

---

### 👁️ ShowDeleted - Affichage des messages supprimés
**Commande**: `!showdeleted [nombre] [@utilisateur]`

Affiche les derniers messages supprimés dans le serveur.

**Exemples**:
- `!showdeleted` - Affiche les 10 derniers messages supprimés
- `!showdeleted 20` - Affiche les 20 derniers messages supprimés
- `!showdeleted @User` - Affiche les messages supprimés de l'utilisateur

**Permissions requises**: `ManageMessages`
**Limites**: 
- Stocke les 100 derniers messages supprimés en mémoire
- Affiche maximum 25 messages par commande

**Note**: Les messages sont automatiquement trackés par l'event `messageDelete`

---

### 🛡️ AntiRaid - Système anti-raid personnalisable
**Commande**: `!antiraid <on|off|config|status>`

Configure et active la protection anti-raid du serveur.

#### Sous-commandes:

**`!antiraid on`** - Active le système anti-raid

**`!antiraid off`** - Désactive le système et déverrouille le serveur

**`!antiraid status`** - Affiche la configuration actuelle

**`!antiraid config <option> <valeur>`** - Configure les paramètres

#### Options de configuration:

| Option | Description | Valeurs | Défaut |
|--------|-------------|---------|--------|
| `joinLimit` | Nombre maximum de joins | 1-20 | 5 |
| `joinWindow` | Fenêtre de temps (secondes) | 5-60 | 10 |
| `action` | Action à effectuer | kick/ban | kick |
| `autoLock` | Verrouillage automatique | true/false | true |

**Exemples**:
```
!antiraid on
!antiraid config joinLimit 8
!antiraid config joinWindow 15
!antiraid config action ban
!antiraid config autoLock false
```

**Fonctionnement**:
1. Détecte quand X membres rejoignent en Y secondes
2. Kick/ban tous les membres récents automatiquement
3. Verrouille le serveur si `autoLock` est activé
4. Envoie une notification dans un salon du serveur

**Permissions requises**: `Administrator`

---

### 👑 Override - Commande KING (Annulation forcée)
**Commande**: `!override <type> <cible>`

Annule toutes les sanctions actives (malédictions, mutes, etc.)

**⚠️ RÉSERVÉ AU KING_ID UNIQUEMENT** (configuré dans `.env`)

#### Types disponibles:

- `curse` - Lève toutes les malédictions
- `mute` - Démute tous les utilisateurs (admin mute)
- `roulettemute` - Arrête tous les roulette mutes
- `all` - Annule TOUT

#### Cibles:

- `@utilisateur` - Pour un utilisateur spécifique
- `all` - Pour tous les utilisateurs du serveur

**Exemples**:
```
!override curse @User          # Lève la malédiction de User
!override mute all             # Démute tous les utilisateurs
!override all all              # Annule TOUTES les sanctions
```

**Fonctionnalités**:
- ✅ Annule immédiatement les sanctions actives
- ✅ Nettoie tous les timeouts et intervals
- ✅ Démute les utilisateurs dans les vocaux
- ✅ Efface toutes les données des Maps internes
- ✅ Affiche un rapport détaillé des actions effectuées

**Permissions requises**: Être le KING (ID configuré dans `.env` comme `KING_ID`)

---

## 🔧 Configuration Requise

Ajoutez ces variables optionnelles à votre fichier `.env`:

```env
# ID du salon pour les logs de messages supprimés (optionnel)
LOG_CHANNEL_ID=123456789012345678

# ID du KING pour la commande override (requis pour !override)
KING_ID=198594808430723072

# ID du salon de bienvenue (utilisé par antiraid aussi)
WELCOME_CHANNEL_ID=729523071647744021
```

---

## 📊 Système de Tracking Automatique

### Event: messageDelete
Enregistre automatiquement les messages supprimés:
- Stocke les 100 derniers messages supprimés
- Enregistre: contenu, auteur, salon, heure, pièces jointes
- Log automatique dans le salon configuré (si `LOG_CHANNEL_ID` est défini)

### Event: guildMemberAdd (amélioré)
Intègre maintenant l'anti-raid:
- Vérifie chaque nouveau membre
- Détecte les raids automatiquement
- Applique les actions configurées
- Message de bienvenue (si pas de raid détecté)

---

## 🎯 Utilisation Recommandée

### Configuration Anti-Raid Initiale:
```
!antiraid config joinLimit 5
!antiraid config joinWindow 10
!antiraid config action kick
!antiraid config autoLock true
!antiraid on
```

### En Cas de Raid:
1. Le bot détecte automatiquement le raid
2. Kick/ban tous les raiders
3. Verrouille le serveur automatiquement
4. Pour déverrouiller: `!antiraid off` puis `!antiraid on`

### Gestion des Sanctions (KING):
```
!override all all              # Urgence: tout annuler
!override curse @Victime       # Lever une malédiction spécifique
!override mute all             # Démuter tout le monde après un événement
```

---

## ⚠️ Notes Importantes

1. **Clear**: Ne peut supprimer que les messages de moins de 14 jours (limitation Discord API)

2. **ShowDeleted**: Les messages sont stockés en mémoire. Si le bot redémarre, l'historique est perdu.

3. **AntiRaid**: Quand le serveur est verrouillé, aucun nouveau membre ne peut rejoindre sans être immédiatement kick/ban.

4. **Override**: Commande très puissante, réservée au KING uniquement. Utiliser avec précaution.

5. **Permissions Bot**: Assurez-vous que le bot a les permissions suivantes:
   - `ManageMessages` (pour clear)
   - `ViewChannel` (pour tracking)
   - `KickMembers` / `BanMembers` (pour antiraid)
   - `MuteMembers` (pour démuter avec override)

---

## 🐛 Résolution de Problèmes

**ShowDeleted ne fonctionne pas**:
- Vérifiez que l'event `messageDelete` est bien chargé au démarrage du bot
- Le bot doit avoir accès au salon où le message est supprimé

**AntiRaid ne se déclenche pas**:
- Vérifiez que le bot a les permissions `KickMembers` ou `BanMembers`
- Assurez-vous que `!antiraid on` est activé
- Le bot ne peut pas kick/ban les administrateurs ou les rôles supérieurs

**Override ne fonctionne pas**:
- Vérifiez que votre ID est correct dans `KING_ID` dans le `.env`
- Les Maps doivent être exportées par les modules (déjà fait dans le code)

---

## 📝 Tests

Pour tester ces nouvelles fonctionnalités:

1. **Clear**: Envoyez quelques messages puis utilisez `!clear 5`
2. **ShowDeleted**: Supprimez un message puis `!showdeleted`
3. **AntiRaid**: Configurez avec des valeurs basses pour tester (ex: `joinLimit 2`)
4. **Override**: En tant que KING, appliquez une malédiction puis `!override curse @vous`

---

Créé le: 2026-01-12
Version: 1.0.0

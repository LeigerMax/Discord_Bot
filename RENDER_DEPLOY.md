# 🚀 Guide de Déploiement et Configuration de Nexus sur Render

Ce guide vous explique étape par étape comment déployer votre bot Discord **Nexus** sur [Render](https://render.com) et le configurer correctement pour que la nouvelle fonctionnalité **Meme Overlay** et son Dashboard fonctionnent parfaitement en production.

---

## 📋 1. Choix du type de service sur Render

Puisque Nexus inclut un Dashboard web (serveur Express intégré via `keepAlive.js`), vous devez le déployer en tant que **Web Service** :
- **Type de service** : `Web Service`
- **Environnement (Runtime)** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm run dev` (ou `node src/bot.js`)

---

## 🔑 2. Variables d'Environnement à configurer

Dans l'onglet **Environment** de votre Web Service sur Render, ajoutez les variables suivantes :

| Variable | Description | Exemple / Valeur |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode d'exécution de l'application | `production` |
| `DISCORD_TOKEN` | Token secret de votre bot Discord | `MTI...` *(À récupérer sur le Discord Dev Portal)* |
| `STORAGE_CHANNEL_ID` | Salon Discord servant de base de données de stockage | `123456789012345678` |
| `SESSION_SECRET` | Clé secrète pour sécuriser les sessions du Dashboard | `UneCleSuperSecreteEtLongue` |
| `DISCORD_CLIENT_ID` | Identifiant client du bot (pour OAuth2) | `123456789012345678` |
| `DISCORD_CLIENT_SECRET`| Clé secrète client du bot (pour OAuth2) | `abc123xyz...` |
| `DISCORD_REDIRECT_URI` | URL de redirection pour le Dashboard OAuth2 | `https://votre-bot.onrender.com/auth/callback` |

---

## ⚡ 3. Configuration de la fonctionnalité "Meme Overlay"

La configuration de la diffusion temps réel de vos mèmes est stockée dans [src/config/botConfig.json](file:///f:/Projets/Discord_Bot/src/config/botConfig.json) :

```json
"memeOverlay": {
  "enabled": true,
  "channelId": "VOTRE_ID_DE_SALON_MEMES_DISCORD",
  "serverUrl": "https://votre-serveur-websocket.onrender.com"
}
```

> [!IMPORTANT]
> - **`channelId`** : Remplacez `"METS_ICI_L_ID_DU_SALON_DISCORD"` par l'identifiant numérique réel de votre salon Discord (ex: `"102438593849182390"`). Pour obtenir cet ID, activez le *Mode Développeur* dans les paramètres de Discord, faites un clic droit sur le salon et sélectionnez *Copier l'identifiant*.
> - **`serverUrl`** : L'adresse URL de votre serveur central Socket.io (par exemple, un autre service déployé sur Render ou Heroku).

---

## 😴 4. Contourner la mise en veille gratuite de Render (Spin-down)

> [!WARNING]
> Les **Web Services gratuits** sur Render se mettent automatiquement en veille (spin-down) après **15 minutes d'inactivité** (lorsqu'aucun trafic HTTP n'arrive sur le Dashboard).
>
> Si le service web s'endort, **votre bot Discord se déconnectera** également !

### Solutions recommandées pour garder le bot en ligne 24/7 :

1. **UptimeRobot / Cron-Job** (Gratuit et simple) :
   - Créez un compte gratuit sur [UptimeRobot](https://uptimerobot.com) ou [cron-job.org](https://cron-job.org).
   - Configurez un ping HTTP (GET) régulier toutes les **5 ou 10 minutes** sur l'URL principale de votre bot :
     `https://votre-bot.onrender.com/`
   - Cela enverra une requête légère à votre serveur Express, empêchant Render de le mettre en veille.

2. **Passer à un plan payant (Starter)** :
   - Pour environ $7/mois, l'instance tourne en continu sans mise en veille et sans avoir besoin de pings externes.

---

## 🛡️ 5. Résolution des problèmes fréquents (Troubleshooting)

### Le bot ne se connecte pas et tourne en boucle (Hang DNS)
Node.js 18+ priorise parfois IPv6, ce qui peut poser problème sur le réseau interne de Render.
* **Solution Nexus** : Notre code dans `src/bot.js` résout déjà ce problème en forçant IPv4 en première position grâce à `dns.setDefaultResultOrder('ipv4first')`.

### Erreur Cloudflare 429 ou 1015 dans les logs
Si vous redéployez trop souvent, l'IP partagée de Render peut être temporairement bloquée par Discord (Rate Limit global).
* **Solution** : Patientez environ 1 heure ou effectuez un déploiement manuel sans cache (*Manual Deploy > Clear Cache & Deploy*) pour tenter d'obtenir une nouvelle IP sur Render.

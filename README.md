# Nexus Bot

<p align="center">
  <img src="src/public/logo.jpg" alt="Nexus Logo" width="120" height="120" style="border-radius: 12px; border: 1.5px solid #334155;">
</p>

<h1 align="center">Nexus Bot</h1>

<p align="center">
  <strong>An modular Discord bot featuring an interactive Web Dashboard, live YouTube monitoring, dynamic voice channels, support tickets, and an entertainment system.</strong>
</p>

<p align="center">
  <a href="https://github.com/LeigerMax/Nexus_Discord_Bot/releases"><img src="https://img.shields.io/github/v/release/LeigerMax/Nexus_Discord_Bot?color=6366F1&label=Version" alt="Version"></a>
  <img src="https://img.shields.io/badge/License-MIT-06B6D4" alt="License">
  <img src="https://img.shields.io/badge/Platform-Node.js-blue" alt="Platform">
  <img src="https://img.shields.io/badge/Framework-Discord.js%20v14-EC4899" alt="Framework Status">
</p>

<p align="center">
  🌐 <strong><a href="README_FR.md">Version Française ici</a></strong>
</p>

---

> [!NOTE]
> 🌐 **Nexus Dashboard**: Fully configure all bot features (YouTube, Statistics, Voice Hub) instantly in real-time through a premium web interface without using a single terminal command!

**Nexus Bot** is an all-in-one Discord bot. Equipped with a **Web Dashboard** powered by Express and Discord OAuth2, it enables administrators to manage notifications, statistics, and support systems in real-time. It is also the central WebSocket broadcaster (Socket.io) for the **Nexus Overlay**: [GitHub Nexus-Overlay](https://github.com/LeigerMax/Nexus-Overlay) desktop application, allowing media shared on Discord to be rendered instantly on users' screens.

---

## 🔮 Key Features

* **📺 YouTube System**: Ultra-stable multi-channel monitoring featuring handle resolution (`@channel`), custom announcements, and high-performance caching to prevent duplicate alerts.
* **📊 Live Server Statistics**: Key metrics (total members, online presence) displayed dynamically in voice channels, utilizing optimized REST API caching to prevent Discord Gateway rate limits.
* **🎙️ Temporary Voice Channels**: Dynamic voice channel hub ("Auto-Channels"). Joining the Hub instantly spawns a private room with custom permissions, which is deleted automatically once empty.
* **🎫 Support Ticket System**: Secure support panel with interactive buttons. Generates private channels accessible only to the author and the Staff team, complete with categorical sorting.
* **💾 Discord-as-a-DB Storage**: Lightweight and autonomous database engine. Configurations are saved using **JSON File Attachments** in a private channel, bypassing the 2000-character limit without external database requirements.
* **🎮 Fun & Curse System**: Over 30 interactive commands (roulette, mini-games) and a full curse engine (`!curse`) featuring 21 distinct server curses (UWU mode, Yoda speak, clown text, vocal mutes, keyboard garbler).
* **🌐 Web Dashboard**: Control panel featuring Discord OAuth2 authentication, real-time configuration tabs, SVG iconography, and responsive design tokens.
* **❓ Built-in Help**: Type `!help` directly in any Discord channel to instantly get the full list of available commands.

---

## 📂 Project Structure

```text
Nexus_Discord_Bot/
├── docs/                  # Project documentation (Guides and visual rules)
├── src/
│   ├── bot.js             # Main Entry Point (loads config, bot events & Express/Socket.io servers)
│   ├── commands/          # Discord Bot slash & prefix commands
│   │   ├── admin/         # Administrative modules (Setup, config)
│   │   ├── fun/           # Fun interactions and curse triggers
│   │   ├── games/         # Entertainment (Russian roulette, coin flip, dice)
│   │   └── general/       # Help, support and status utilities
│   ├── config/            # Local configuration templates
│   │   ├── botConfig.json # JSON structure defining modules configurations
│   │   └── version.json   # Versions catalog & releases updates log
│   ├── events/            # Discord.js Event listeners (messageCreate, ready)
│   ├── middlewares/       # Security filters & sessions for Express Dashboard
│   ├── public/            # Web Dashboard Frontend Client
│   │   ├── index.html     # Dashboard login page (Secure Discord OAuth2)
│   │   ├── dashboard.html # Tabs manager GUI (YouTube, Anti-Raid, Stats configuration)
│   │   ├── style.css      # Premium Cyber-Minimalist styling (variables, gradients, CSS Glassmorphism)
│   │   └── logo.jpg       # Brand identity logotype
│   ├── services/          # Core background services (storage, updates, statistics)
│   │   ├── auditService.js # Actions logging system
│   │   ├── keepAlive.js   # Express Web Dashboard & Socket.io server manager
│   │   ├── statsService.js# Rest API counters aggregator
│   │   ├── storageService.js # File attachment DB (Discord-as-a-DB)
│   │   └── youtubeService.js # Caching YouTube feed observer
│   └── utils/             # Helper libraries and functional utilities
├── .env                   # Local system environment variables
├── package.json           # Tasks manager scripts, bot runtime configurations and dependencies
└── README.md              # Main entry documentation pointing to active sub-documents
```

---

## 🛠️ Local Installation & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (Version 18+ recommended)
* [Git](https://git-scm.com/)

### Step 1: Clone the repository
```bash
git clone https://github.com/LeigerMax/Nexus_Discord_Bot.git
cd Nexus_Discord_Bot
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file at the root of the project with the following keys:
```env
DISCORD_TOKEN=your_bot_token
STORAGE_CHANNEL_ID=your_private_channel_id
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:10000/auth/callback
SESSION_SECRET=a_long_random_secret_string
PORT=10000
```

### Step 4: Launch the bot in dev mode
```bash
npm run dev
```

### Step 5: Run Automated Tests
```bash
npm run test
```

---

## 📝 License
This project is licensed under the **MIT License**. See the license file for details.

---

## 🔗 Contact & Links
* **Developer**: [LeigerMax (Allmaxou)](https://github.com/LeigerMax/)
* **Official Discord Bot**: [GitHub Nexus_Discord_Bot](https://github.com/LeigerMax/Nexus_Discord_Bot)
* **Desktop App Repository**: [GitHub Nexus-Overlay](https://github.com/LeigerMax/Nexus-Overlay)

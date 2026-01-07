# Discord Bot

A feature-rich Discord bot with fun commands, admin tools, and an advanced curse system for enhanced server entertainment.

**Developed by:** [@LeigerMax](https://github.com/LeigerMax)

---

## 📋 Table of Contents

- [Features](#features)
- [Commands](#commands)
  - [General Commands](#general-commands)
  - [Fun Commands](#fun-commands)
  - [Admin Commands](#admin-commands)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Curse System](#curse-system)
- [Events](#events)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- 🎮 **30+ Fun Commands** - Dice rolls, roulette, hugs, slaps, and more
- ⚙️ **Admin Tools** - Auto-messages, voice mute enforcement, welcome system
- 👹 **Advanced Curse System** - 20 different curses with hidden mode
- 📊 **Activity Tracking** - Monitor user presence and voice states
- 🎯 **Interactive Menus** - Category-based help system with dropdowns
- 🔧 **Modular Architecture** - Easy to extend and customize
- 🌐 **Multi-language Support** - Currently in French

---

## 🎮 Commands

### General Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!help` | Display all available commands with interactive menu | `!help` |
| `!ping` | Check bot latency | `!ping` |

### Fun Commands

#### 🎲 Games & Random

| Command | Description | Usage |
|---------|-------------|-------|
| `!dice [sides]` | Roll a dice (default: 6 sides) | `!dice` or `!dice 20` |
| `!roll [max]` | Roll a number (default: 1-100) | `!roll` or `!roll 1000` |
| `!coin` | Flip a coin | `!coin` |
| `!random` | Get a random number | `!random` |
| `!roulette` | Play Russian roulette | `!roulette` |
| `!roulettehard` | Hardcore Russian roulette | `!roulettehard` |
| `!roulettemute` | Russian roulette with voice mute | `!roulettemute` |

#### 😄 Social & Interactions

| Command | Description | Usage |
|---------|-------------|-------|
| `!hug @user` | Hug someone | `!hug @friend` |
| `!kiss @user` | Kiss someone | `!kiss @crush` |
| `!slap @user` | Slap someone | `!slap @annoying` |
| `!coach @user` | Motivate someone | `!coach @teammate` |
| `!who` | Random member selection | `!who` |

#### 🎪 Chaos & Memes

| Command | Description | Usage |
|---------|-------------|-------|
| `!spam @user` | Spam mentions | `!spam @victim` |
| `!rage` | Express rage | `!rage` |
| `!osef` | Express indifference | `!osef` |
| `!brain` | Show brain meme | `!brain` |
| `!keyboard` | Keyboard smash | `!keyboard` |
| `!wifi` | WiFi quality check | `!wifi` |
| `!monitor` | Monitor rage meme | `!monitor` |
| `!miguel` | Check Miguel's status | `!miguel` |

#### 👹 Curse System

| Command | Description | Usage |
|---------|-------------|-------|
| `!curse @user [duration]` | Curse a player (random curse) | `!curse @victim 10` |
| `!curse random [duration]` | Curse random voice user | `!curse random 5` |
| `!curse hidden @user [duration] [TYPE]` | Secret curse with specific type | `!curse hidden @victim 10 UWU_MODE` |
| `!curse types` | List all curse types (DM) | `!curse types` |
| `!curse list` | Show all cursed players | `!curse list` |
| `!curse clear` | Clear all curses (Admin) | `!curse clear` |

### Admin Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!auto [seconds] [message]` | Send auto-message every X seconds | `!auto 60 Vote for server!` |
| `!auto stop` | Stop auto-messages | `!auto stop` |
| `!mute @user [minutes]` | Enforced voice mute (1-60 min) | `!mute @troll 5` |
| `!welcome` | Configure welcome messages | `!welcome` |

---

## 🔧 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v16.9.0 or higher
- [Discord Bot Token](https://discord.com/developers/applications)
- npm package manager (inclus avec Node.js)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeigerMax/Discord_Bot.git
   cd Discord_Bot
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   
   This will automatically install all required packages:
   - `discord.js` ^14.25.1 - Discord API library
   - `@discordjs/voice` ^0.19.0 - Voice support
   - `express` ^5.2.1 - Web server (keep-alive)
   - `dotenv` ^17.2.3 - Environment variables
   - `node-fetch` ^2.7.0 - HTTP client
   - `play-dl` ^1.9.7 - Audio streaming
   - `@snazzah/davey` ^0.1.8 - Discord utilities
   
   📋 **See [DEPENDENCIES.md](DEPENDENCIES.md) for detailed dependency information and troubleshooting**

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   LOOSER_ID=user_id_to_track
   ACTIVITY_SALON_ID=channel_id_for_activity_logs
   PORT=8080
   ```

4. **Configure Discord Developer Portal**
   
   Enable these Gateway Intents in your [Discord Application](https://discord.com/developers/applications):
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
   - ✅ **Presence Intent**

5. **Start the bot**
   ```bash
   node src/bot.js
   ```
   
   The bot will start along with a web server on port 8080 to keep it alive (useful for free hosting services).

### Alternative: Install Specific Versions

If you encounter compatibility issues:

```bash
npm install discord.js@14.25.1 @discordjs/voice@0.19.0 dotenv@17.2.3 express@5.2.1 node-fetch@2.7.0 play-dl@1.9.7 @snazzah/davey@0.1.8
```

---

## ⚙️ Configuration

### Required Permissions

The bot requires the following Discord permissions:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Manage Messages (delete messages)
- ✅ Embed Links
- ✅ Read Message History
- ✅ Add Reactions
- ✅ Mute Members (voice)
- ✅ Manage Channels (for auto-messages)
- ✅ View Server Members
- ✅ Presence Intent

### Gateway Intents

Required intents in `src/bot.js`:
```javascript
GatewayIntentBits.Guilds
GatewayIntentBits.GuildMessages
GatewayIntentBits.MessageContent
GatewayIntentBits.GuildVoiceStates
GatewayIntentBits.GuildMembers
GatewayIntentBits.GuildPresences
GatewayIntentBits.DirectMessages
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DISCORD_TOKEN` | Your Discord bot token | ✅ Yes | - |
| `PORT` | Port for keep-alive web server | ❌ Optional | 8080 |
| `LOOSER_ID` | User ID for presence tracking | ❌ Optional | - |
| `ACTIVITY_SALON_ID` | Channel ID for activity logs | ❌ Optional | - |

### Keep-Alive System

The bot includes an Express web server that keeps it running 24/7 (useful for free hosting platforms like Replit, Glitch, etc.):
- Starts automatically with the bot
- Accessible at `http://localhost:8080` (or your configured PORT)
- Returns "Le bot est en ligne !" on root endpoint
- Use with [UptimeRobot](https://uptimerobot.com/) to ping your bot URL every 5 minutes

---

## 🎯 Usage

### Command Prefix

All commands use the `!` prefix.

### Interactive Help Menu

Use `!help` to open an interactive menu with dropdown categories:
- 🏠 **Home** - Overview
- ⚙️ **Administration** - Admin commands
- 🎮 **Fun** - Entertainment commands
- 📋 **General** - Basic commands

---

## 👹 Curse System

The curse system is the bot's most advanced feature, offering 20 different curse types that can be applied to users.

### Curse Types

#### Command-Altering Curses

| Type | Effect |
|------|--------|
| 🎲 **RANDOM_RESPONSES** | All commands return absurd responses |
| 👻 **IGNORED** | Bot ignores all messages |
| 🚫 **BLOCKED** | No commands work |
| 💀 **WORST_LUCK** | All random results are worst possible |
| 🐌 **SLOW_MODE** | Bot responds with 10s delay |
| 🔄 **REVERSED** | Commands target the cursed player instead |

#### Message-Altering Curses

| Type | Effect | Example |
|------|--------|---------|
| 🔀 **MESSAGE_SCRAMBLER** | Words are shuffled | "Hello world" → "world Hello" |
| 🔄 **MESSAGE_OPPOSER** | Messages say the opposite | "I love this" → "I hate this" |
| 🤡 **CLOWN_MODE** | Clown emojis everywhere | "Hi" → "Hi 🤡" |
| 😺 **UWU_MODE** | UwU speak transformation | "Hello" → "H-Hewwo >///<" |
| 🗣️ **YODA_MODE** | Yoda-style word order | "I am here" → "here am I" |
| 📢 **CAPS_LOCK** | ALL CAPS WITH EXCLAMATION!!!! | "ok" → "OK!!!!" |
| 🏴‍☠️ **PIRATE_MODE** | Pirate speak | "Hello" → "Ahoy, arr!" |
| 🎯 **VOWEL_REMOVER** | All vowels removed | "Hello" → "Hll" |
| 🔁 **REVERSE_TEXT** | Text reversed | "Hello" → "olleH" |
| 🌈 **RANDOM_EMOJI** | Words replaced with emojis | "food" → "🍕" |

#### Social Curses

| Type | Effect |
|------|--------|
| 📢 **PUBLIC_SHAME** | Bot reminds everyone you're cursed |
| 💥 **SPAM** | Random mention spam |

#### Technical Curses

| Type | Effect |
|------|--------|
| 🔇 **VOICE_MUTE** | Enforced voice mute with monitoring |
| 🔀 **GARBLED** | Commands are deformed before execution |

### Hidden Mode

Use hidden mode to curse someone secretly:

```bash
!curse hidden @target 10 UWU_MODE
```

**Features:**
- ✅ Your command is deleted immediately
- ✅ No public announcement
- ✅ Target doesn't know who cursed them
- ✅ Confirmation sent via DM
- ✅ Choose specific curse type

**Get curse types list:**
```bash
!curse types
```
This sends you a DM with all available curse types.

### Duration & Limits

- **Minimum Duration:** 1 minute
- **Maximum Duration:** 30 minutes
- **Concurrent Curses:** One per player
- **Auto-Removal:** Curses lift automatically when time expires

---

## 🎭 Events

The bot handles various Discord events:

### `presenceUpdate.js`
Tracks user online/offline status and sends notifications for specific users.

### `voiceStateUpdate.js`
Monitors voice channel joins/leaves and state changes.

### `guildMemberAdd.js`
Welcomes new members to the server.

### `dmReply.js`
Handles direct message interactions.

### `cursedMessages.js`
Intercepts and modifies messages from cursed players.

---

## 📁 Project Structure

```
Discord_Bot/
├── src/
│   ├── bot.js                 # Main bot file
│   ├── commands/
│   │   ├── admin/             # Admin commands
│   │   │   ├── auto.js
│   │   │   ├── mute.js
│   │   │   └── welcome.js
│   │   ├── fun/               # Fun commands
│   │   │   ├── curse.js       # Main curse system
│   │   │   ├── dice.js
│   │   │   ├── hug.js
│   │   │   └── ... (30+ commands)
│   │   └── general/           # General commands
│   │       ├── help.js
│   │       └── ping.js
│   ├── events/                # Event handlers
│   │   ├── cursedMessages.js
│   │   ├── presenceUpdate.js
│   │   └── voiceStateUpdate.js
│   ├── utils/
│   │   └── commandHandler.js  # Command processor
│   ├── config/                # Configuration files
│   └── services/              # Additional services
├── .env                       # Environment variables
├── package.json
├── LICENSE
└── README.md
```

---

## 🛠️ Development

### Adding New Commands

1. Create a new file in the appropriate category folder:
   ```javascript
   // src/commands/fun/mycommand.js
   module.exports = {
     name: 'mycommand',
     description: 'Command description',
     usage: '!mycommand [args]',
     
     async execute(message, args) {
       // Your command logic
       message.reply('Hello!');
     }
   };
   ```

2. The command will be automatically loaded by the command handler.

### Adding New Curses

Add a new curse type in `src/commands/fun/curse.js`:

```javascript
CURSES: {
  MY_CURSE: {
    name: '🎯 My Curse Name',
    description: 'What this curse does',
    emoji: '🎯',
    color: 0xFF0000
  }
}
```

Then implement the behavior in:
- `src/utils/commandHandler.js` (for command curses)
- `src/events/cursedMessages.js` (for message curses)

---

## 📊 Dependencies

```json
{
  "discord.js": "^14.x",
  "dotenv": "^16.x"
}
```



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Features Showcase

### Interactive Help System
- Category-based navigation with dropdown menus
- Real-time command counting
- Detailed command descriptions with usage examples

### Enforced Voice Mute
- Prevents users from unmuting themselves
- Sends mocking GIFs when unmute attempts are detected
- Auto-removal after timer expires

### Auto-Message System
- Schedule recurring messages in any channel
- Easy start/stop controls
- One auto-message per channel

### Advanced Curse System
- 20 unique curse types
- Hidden mode for stealth cursing
- Message alteration in real-time
- Command redirection
- Time-based automatic removal

---

## 🙏 Acknowledgments

- Built with [Discord.js](https://discord.js.org/)

---

**Developed by:** [@LeigerMax](https://github.com/LeigerMax)

---

⭐ **Star this repository if you found it useful!**

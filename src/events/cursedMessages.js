/**
 * @file Cursed Messages Event
 * @description Gère les messages des joueurs maudits (altération de texte)
 * @version 1.0.0
 */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    try {
      // Ignore les bots et les commandes
      if (message.author.bot) return;
      if (message.content.startsWith('!')) return;
      
      // Récupère la commande curse pour vérifier les malédictions
      const commandHandler = client.commandHandler;
      if (!commandHandler) return;
      
      const curseCommand = commandHandler.commands.get('curse');
      if (!curseCommand?.isCursed(message.author.id)) return;
      
      const curseType = curseCommand.getCurseType(message.author.id);
      
      // Malédictions qui altèrent les messages
      const messageAlteringCurses = [
        'MESSAGE_SCRAMBLER',
        'MESSAGE_OPPOSER', 
        'CLOWN_MODE',
        'UWU_MODE',
        'YODA_MODE',
        'CAPS_LOCK',
        'PIRATE_MODE',
        'VOWEL_REMOVER',
        'REVERSE_TEXT',
        'RANDOM_EMOJI'
      ];
      
      if (!messageAlteringCurses.includes(curseType)) return;
      
      // Sauvegarde le message original
      const originalMessage = message.content;
      let alteredMessage = originalMessage;
      
      // Applique l'altération selon le type de malédiction
      switch (curseType) {
        case 'MESSAGE_SCRAMBLER':
          alteredMessage = scrambleWords(originalMessage);
          break;
          
        case 'MESSAGE_OPPOSER':
          alteredMessage = oppositeMessage(originalMessage);
          break;
          
        case 'CLOWN_MODE':
          alteredMessage = addClownEmojis(originalMessage);
          break;
          
        case 'UWU_MODE':
          alteredMessage = uwuify(originalMessage);
          break;
          
        case 'YODA_MODE':
          alteredMessage = yodaSpeak(originalMessage);
          break;
          
        case 'CAPS_LOCK':
          alteredMessage = originalMessage.toUpperCase() + '!!!!';
          break;
          
        case 'PIRATE_MODE':
          alteredMessage = piratify(originalMessage);
          break;
          
        case 'VOWEL_REMOVER':
          alteredMessage = removeVowels(originalMessage);
          break;
          
        case 'REVERSE_TEXT':
          alteredMessage = originalMessage.split('').reverse().join('');
          break;
          
        case 'RANDOM_EMOJI':
          alteredMessage = randomEmojiReplace(originalMessage);
          break;
      }
      
      // Supprime le message original
      await message.delete().catch(() => {});
      
      // Envoie le message altéré
      await message.channel.send(`**${message.author.username}** a dit : ${alteredMessage}`);
      
    } catch (error) {
      console.error('Erreur dans cursedMessages:', error);
    }
  });
};

// Fonctions d'altération

function scrambleWords(text) {
  const words = text.split(' ');
  // Mélange l'ordre des mots
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(' ');
}

function oppositeMessage(text) {
  // Dictionnaire étendu d'opposés
  const opposites = {
    // Affirmation/Négation
    'oui': 'non',
    'non': 'oui',
    'peut-être': 'certainement pas',
    'sûrement': 'pas du tout',
    
    // Sentiments positifs → négatifs
    'bien': 'mal',
    'bon': 'mauvais',
    'génial': 'nul',
    'super': 'pourri',
    'cool': 'nul',
    'top': 'naze',
    'excellent': 'horrible',
    'parfait': 'raté',
    'magnifique': 'moche',
    'beau': 'laid',
    'joli': 'moche',
    'sympa': 'chiant',
    'agréable': 'désagréable',
    'merveilleux': 'affreux',
    
    // Sentiments négatifs → positifs
    'mal': 'bien',
    'mauvais': 'bon',
    'nul': 'génial',
    'pourri': 'super',
    'naze': 'top',
    'horrible': 'excellent',
    'raté': 'parfait',
    'moche': 'magnifique',
    'laid': 'beau',
    'chiant': 'sympa',
    'affreux': 'merveilleux',
    
    // Émotions
    'aime': 'déteste',
    'adore': 'hais',
    'déteste': 'adore',
    'hais': 'adore',
    'kiffe': 'déteste',
    'content': 'triste',
    'triste': 'content',
    'heureux': 'malheureux',
    'joyeux': 'déprimé',
    'ravi': 'déçu',
    'déçu': 'ravi',
    'en colère': 'calme',
    'énervé': 'zen',
    
    // Actions
    'vais': 'ne vais pas',
    'veux': 'ne veux pas',
    'peux': 'ne peux pas',
    'dois': 'ne dois pas',
    'fais': 'ne fais pas',
    'aime': 'n\'aime pas',
    
    // Quantités
    'beaucoup': 'peu',
    'peu': 'beaucoup',
    'trop': 'pas assez',
    'tout': 'rien',
    'rien': 'tout',
    'tous': 'aucun',
    'aucun': 'tous',
    'plein': 'vide',
    'vide': 'plein',
    
    // Intensité
    'très': 'pas du tout',
    'vraiment': 'pas vraiment',
    'tellement': 'absolument pas',
    
    // Qualités
    'facile': 'difficile',
    'difficile': 'facile',
    'simple': 'compliqué',
    'compliqué': 'simple',
    'intelligent': 'bête',
    'bête': 'intelligent',
    'fort': 'faible',
    'faible': 'fort',
    'grand': 'petit',
    'petit': 'grand',
    'gros': 'maigre',
    'rapide': 'lent',
    'lent': 'rapide',
    
    // Temps/Espace
    'jour': 'nuit',
    'nuit': 'jour',
    'chaud': 'froid',
    'froid': 'chaud',
    'près': 'loin',
    'loin': 'près',
    'haut': 'bas',
    'bas': 'haut',
    'avant': 'après',
    'après': 'avant',
    'tôt': 'tard',
    'tard': 'tôt',
    
    // Verbes communs
    'commence': 'termine',
    'termine': 'commence',
    'part': 'arrive',
    'arrive': 'part',
    'monte': 'descends',
    'descends': 'monte',
    'entre': 'sors',
    'sors': 'entre',
    'gagne': 'perds',
    'perds': 'gagne',
    
    // Logique
    'vrai': 'faux',
    'faux': 'vrai',
    'exact': 'inexact',
    'correct': 'incorrect',
    'possible': 'impossible',
    'impossible': 'possible'
  };
  
  let result = text;
  
  // Étape 1: Gère les négations (ajoute ou retire "ne...pas", "n'...pas")
  // Retire les négations existantes
  result = result.replace(/\bn[e']?\s+(\w+)\s+pas\b/gi, '$1');
  result = result.replace(/\bne\s+(\w+)\s+jamais\b/gi, '$1 toujours');
  result = result.replace(/\bjamais\b/gi, 'toujours');
  result = result.replace(/\btoujours\b/gi, 'jamais');
  
  // Étape 2: Remplace les mots par leurs opposés (insensible à la casse)
  for (const [word, opposite] of Object.entries(opposites)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Préserve la capitalisation
      if (match[0] === match[0].toUpperCase()) {
        return opposite.charAt(0).toUpperCase() + opposite.slice(1);
      }
      return opposite;
    });
  }
  
  // Étape 3: Si le message commence par certains verbes, ajoute une négation
  const needsNegation = /^(je (vais|suis|fais|pense|crois|veux|peux|dois))/i;
  if (needsNegation.test(result) && !result.includes('ne') && !result.includes('pas')) {
    result = result.replace(/^(je) (\w+)/i, '$1 ne $2 pas');
  }
  
  return result;
}

function addClownEmojis(text) {
  const words = text.split(' ');
  return words.map(word => `${word} 🤡`).join(' ');
}

function uwuify(text) {
  let uwu = text
    .replace(/r|l/gi, 'w')
    .replace(/R|L/g, 'W')
    .replace(/n([aeiou])/gi, 'ny$1')
    .replace(/N([aeiou])/g, 'Ny$1')
    .replace(/ove/gi, 'uv');
  
  // Ajoute des stutter aléatoires
  const words = uwu.split(' ');
  uwu = words.map(word => {
    if (Math.random() < 0.3 && word.length > 2) {
      return `${word[0]}-${word}`;
    }
    return word;
  }).join(' ');
  
  // Ajoute des emoticons
  const emoticons = [' >///<', ' >w<', ' uwu', ' owo', ' :3'];
  uwu += emoticons[Math.floor(Math.random() * emoticons.length)];
  
  return uwu;
}

function yodaSpeak(text) {
  const words = text.split(' ');
  if (words.length < 3) return text;
  
  // Inverse l'ordre de certains mots
  const lastWord = words.pop();
  words.unshift(lastWord);
  
  return words.join(' ');
}

function piratify(text) {
  let pirate = text
    .replace(/\bje\b/gi, 'moussaillon')
    .replace(/\btu\b/gi, 'toi le marin')
    .replace(/\boui\b/gi, 'aye')
    .replace(/\bnon\b/gi, 'narr')
    .replace(/\bbonjour\b/gi, 'ahoy')
    .replace(/\bsalut\b/gi, 'yo ho');
  
  // Ajoute des expressions pirates
  const endings = [', arr!', ', moussaillon!', ', par Neptune!', ', sacrebleu!'];
  pirate += endings[Math.floor(Math.random() * endings.length)];
  
  return pirate;
}

function removeVowels(text) {
  return text.replace(/[aeiouyAEIOUY]/g, '');
}

function randomEmojiReplace(text) {
  const emojiMap = {
    'manger': '🍕',
    'boire': '🍺',
    'dormir': '😴',
    'jouer': '🎮',
    'content': '😊',
    'triste': '😢',
    'rire': '😂',
    'peur': '😱',
    'amour': '❤️',
    'feu': '🔥',
    'eau': '💧',
    'soleil': '☀️',
    'lune': '🌙',
    'argent': '💰',
    'temps': '⏰'
  };
  
  let result = text;
  for (const [word, emoji] of Object.entries(emojiMap)) {
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
    result = result.replace(regex, emoji);
  }
  
  return result;
}

/**
 * Serveur web Express pour garder le bot actif
 */

const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Le bot est en ligne !');
});

/**
 * Démarre le serveur web sur le port 8080
 * Garde le bot actif en répondant aux requêtes HTTP
 */
function keepAlive() {
  const PORT = process.env.PORT || 8080;
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Serveur web actif sur le port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`${'='.repeat(50)}\n`);
  });
}

module.exports = keepAlive;

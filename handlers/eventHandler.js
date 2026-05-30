const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  let total = 0;
  for (const file of files) {
    try {
      const event = require(path.join(eventsPath, file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      total++;
    } catch (e) {
      console.error(`Erreur chargement event ${file}:`, e.message);
    }
  }
  console.log(`✅ ${total} events chargés`);
};

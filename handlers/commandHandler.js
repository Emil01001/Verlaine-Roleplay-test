const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();
  client.aliases = new Map();
  client.cooldowns = new Map();

  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath);

  let total = 0;

  const register = (command) => {
    if (!command || !command.name) return;
    client.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        client.aliases.set(alias, command.name);
      }
    }
    total++;
  };

  for (const category of categories) {
    const catPath = path.join(commandsPath, category);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const exported = require(path.join(catPath, file));
        // Support array exports (e.g. rpactions.js)
        if (Array.isArray(exported)) {
          for (const command of exported) register(command);
        } else {
          register(exported);
        }
      } catch (e) {
        console.error(`Erreur chargement commande ${file}:`, e.message);
      }
    }
  }
  console.log(`✅ ${total} commandes chargées`);
};

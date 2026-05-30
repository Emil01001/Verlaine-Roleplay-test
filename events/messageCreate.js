const config = require('../config');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    let command = client.commands.get(commandName);
    if (!command) {
      const alias = client.aliases.get(commandName);
      if (alias) command = client.commands.get(alias);
    }
    if (!command) return;

    // Cooldown
    if (command.cooldown) {
      const key = `${command.name}_${message.author.id}`;
      const now = Date.now();
      const cd = client.cooldowns.get(key);
      if (cd && now < cd) {
        const remain = Math.ceil((cd - now) / 1000);
        return message.reply(`⏳ Attend encore **${remain}s** avant de réutiliser \`${config.prefix}${command.name}\`.`);
      }
      client.cooldowns.set(key, now + command.cooldown * 1000);
      setTimeout(() => client.cooldowns.delete(key), command.cooldown * 1000);
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Erreur commande ${commandName}:`, err);
      message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.').catch(() => {});
    }
  },
};

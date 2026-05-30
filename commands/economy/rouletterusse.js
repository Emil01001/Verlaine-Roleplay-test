const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'rouletterusse',
  aliases: ['russe'],
  description: 'Lance une roulette russe (1/6 chance de perdre tout)',
  usage: '-rouletterusse <mise>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**.');
    const eco = getEconomy(message.author.id);
    if (eco.balance<bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    const bang = Math.floor(Math.random() * 6) === 0;

    await message.reply('🔫 *Le cylindre tourne...*');
    await new Promise(r => setTimeout(r, 2000));

    if (bang) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('💥 BANG !')
        .setDescription(`**${message.author.username}** a appuyé sur la détente... **BANG !**\n\n💀 Tu perds **${bet.toLocaleString()} coins** !`)
        .setFooter({ text: 'Verlaine Rôleplay • Roulette Russe' });
      return message.channel.send({ embeds: [embed] });
    }

    const gain = Math.floor(bet * 1.8);
    addBalance(message.author.id, bet + gain);
    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('😮‍💨 Click... Tu es vivant !')
      .setDescription(`**${message.author.username}** a survécu à la roulette russe !\n\n💰 Tu gagnes **+${gain.toLocaleString()} coins** (x1.8) !`)
      .setFooter({ text: 'Verlaine Rôleplay • Roulette Russe' });
    message.channel.send({ embeds: [embed] });
  },
};

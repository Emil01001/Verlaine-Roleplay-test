const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'roll',
  aliases: ['roulette'],
  description: 'Jouer à la roulette',
  usage: '-roll <mise> <red|black|vert>',
  cooldown: 3,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();
    if (!bet || bet < 10 || !choice || !['red', 'black', 'vert'].includes(choice)) {
      return message.reply('❌ Usage : `-roll <mise> <red/black/vert>` (Red x2, Black x2, Vert x16)');
    }

    const eco = getEconomy(message.author.id);
    if (eco.balance < bet) return message.reply(`❌ Solde insuffisant ! Tu as **${eco.balance.toLocaleString()}** coins.`);

    removeBalance(message.author.id, bet);

    const rand = Math.random();
    let result, resultEmoji, winMult = 0;

    if (rand < 0.025) { result = 'vert'; resultEmoji = '🟢'; }
    else if (rand < 0.5125) { result = 'red'; resultEmoji = '🔴'; }
    else { result = 'black'; resultEmoji = '⚫'; }

    const choiceEmoji = choice === 'red' ? '🔴' : choice === 'black' ? '⚫' : '🟢';
    const won = result === choice;

    if (won) {
      winMult = choice === 'vert' ? 16 : 2;
      const winAmount = bet * winMult;
      addBalance(message.author.id, winAmount);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🎲 Roulette — Victoire !')
        .setDescription(
          `La bille s'arrête sur ${resultEmoji} **${result.toUpperCase()}** !\n\n` +
          `Tu avais misé sur ${choiceEmoji} **${choice.toUpperCase()}** — **Victoire !**\n\n` +
          `💰 Tu gagnes **+${winAmount.toLocaleString()} coins** (x${winMult}) !`
        )
        .setFooter({ text: `Verlaine Rôleplay • Solde: ${getEconomy(message.author.id).balance.toLocaleString()} coins` });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle('🎲 Roulette — Défaite !')
      .setDescription(
        `La bille s'arrête sur ${resultEmoji} **${result.toUpperCase()}** !\n\n` +
        `Tu avais misé sur ${choiceEmoji} **${choice.toUpperCase()}** — **Défaite !**\n\n` +
        `😢 Tu perds **${bet.toLocaleString()} coins** !`
      )
      .setFooter({ text: `Verlaine Rôleplay • Solde: ${getEconomy(message.author.id).balance.toLocaleString()} coins` });
    message.reply({ embeds: [embed] });
  },
};

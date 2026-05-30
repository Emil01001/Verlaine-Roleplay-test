const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const symbols = [
  { emoji: '🍒', weight: 30, mult: 2 },
  { emoji: '🍋', weight: 25, mult: 3 },
  { emoji: '🍇', weight: 20, mult: 4 },
  { emoji: '🔔', weight: 13, mult: 6 },
  { emoji: '💎', weight: 8, mult: 10 },
  { emoji: '7️⃣', weight: 4, mult: 20 },
];

function spin() {
  const total = symbols.reduce((s, x) => s + x.weight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const s of symbols) { acc += s.weight; if (r < acc) return s; }
  return symbols[0];
}

module.exports = {
  name: 'slots',
  aliases: ['machine', 'slot'],
  description: 'Jouer à la machine à sous',
  usage: '-slots <mise>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**. Usage : `-slots <mise>`');

    const eco = getEconomy(message.author.id);
    if (eco.balance < bet) return message.reply(`❌ Solde insuffisant ! Tu as **${eco.balance.toLocaleString()}** coins.`);

    removeBalance(message.author.id, bet);

    const reels = [spin(), spin(), spin()];
    const display = reels.map(r => r.emoji).join(' | ');

    let win = false, multiplier = 0, desc = '';

    if (reels[0].emoji === reels[1].emoji && reels[1].emoji === reels[2].emoji) {
      multiplier = reels[0].mult;
      win = true;
      desc = `🎊 **JACKPOT ! x${multiplier}** — Trois ${reels[0].emoji} d'affilée !`;
    } else if (reels[0].emoji === reels[1].emoji || reels[1].emoji === reels[2].emoji || reels[0].emoji === reels[2].emoji) {
      multiplier = 1.5;
      win = true;
      desc = `✨ **Deux symboles identiques !** — x1.5`;
    } else {
      desc = `😢 Aucun symbole identique — Tu perds **${bet.toLocaleString()} coins** !`;
    }

    let winAmount = 0;
    if (win) {
      winAmount = Math.floor(bet * multiplier);
      addBalance(message.author.id, winAmount);
      desc += `\n💰 Gain : **+${winAmount.toLocaleString()} coins** !`;
    }

    const embed = new EmbedBuilder()
      .setColor(win ? config.colors.success : config.colors.error)
      .setTitle('🎰 Machine à Sous — Verlaine Rôleplay')
      .setDescription(`\`\`\`\n┌─────────────────┐\n│  ${display}  │\n└─────────────────┘\`\`\`\n${desc}`)
      .addFields(
        { name: '💰 Mise', value: `${bet.toLocaleString()} coins`, inline: true },
        { name: '🏦 Solde', value: `${getEconomy(message.author.id).balance.toLocaleString()} coins`, inline: true },
      )
      .setFooter({ text: 'Verlaine Rôleplay • Slots' });

    message.reply({ embeds: [embed] });
  },
};

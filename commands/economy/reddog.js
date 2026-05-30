const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

function getCard() {
  const v = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const s = ['♠','♥','♦','♣'];
  return { v: v[Math.floor(Math.random()*13)], s: s[Math.floor(Math.random()*4)] };
}
function numVal(c) {
  if(c.v==='A') return 14; if(c.v==='K') return 13; if(c.v==='Q') return 12; if(c.v==='J') return 11;
  return parseInt(c.v);
}

module.exports = {
  name: 'reddog',
  description: 'Lance une partie de Red Dog',
  usage: '-reddog <mise>',
  cooldown: 3,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**. Usage: `-reddog <mise>`');
    const eco = getEconomy(message.author.id);
    if (eco.balance<bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    const c1 = getCard(), c2 = getCard(), c3 = getCard();
    const v1 = numVal(c1), v2 = numVal(c2), v3 = numVal(c3);
    const [low, high] = v1 < v2 ? [v1, v2] : [v2, v1];
    const spread = high - low - 1;

    let mult, result;
    if (v1 === v2) {
      result = 'push';
      addBalance(message.author.id, bet);
    } else if (v3 > low && v3 < high) {
      if (spread <= 0) mult = 5;
      else if (spread === 1) mult = 4;
      else if (spread === 2) mult = 2;
      else mult = 1;
      result = 'win';
      addBalance(message.author.id, bet + Math.floor(bet*mult));
    } else {
      result = 'lose';
    }

    const embed = new EmbedBuilder()
      .setColor(result==='win'?config.colors.success:result==='push'?config.colors.warning:config.colors.error)
      .setTitle('🐕 Red Dog')
      .setDescription(
        `**Cartes 1 & 2 :** ${c1.v}${c1.s}  —  ${c2.v}${c2.s}\n` +
        `**Spread :** ${spread < 0 ? 'Paire (remboursé)' : spread}\n` +
        `**Carte 3 :** ${c3.v}${c3.s}\n\n` +
        (result==='win' ? `🎉 La carte 3 est entre les deux ! **+${Math.floor(bet*mult).toLocaleString()} coins** (x${mult}) !`
        : result==='push' ? `🤝 Paire ! Mise remboursée.`
        : `😢 La carte 3 est hors de l'écart. Tu perds **${bet.toLocaleString()} coins**.`)
      )
      .setFooter({ text: 'Verlaine Rôleplay • Red Dog' });

    message.reply({ embeds: [embed] });
  },
};

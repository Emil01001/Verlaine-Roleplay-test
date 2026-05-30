const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'pfc',
  aliases: ['coinflip', 'cf'],
  description: 'Pierre feuille ciseau contre un autre joueur',
  usage: '-pfc <@utilisateur> <mise>',
  cooldown: 3,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const bet = parseInt(args[1] || args[0]);
    if (!target || target.bot || target.id === message.author.id) return message.reply('❌ Mentionne un joueur valide.');
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**.');

    const eco1 = getEconomy(message.author.id);
    const eco2 = getEconomy(target.id);
    if (eco1.balance < bet) return message.reply(`❌ Solde insuffisant ! Tu as **${eco1.balance}** coins.`);
    if (eco2.balance < bet) return message.reply(`❌ **${target.username}** n'a pas assez de coins.`);

    const choices = ['Pierre 🪨', 'Feuille 📄', 'Ciseau ✂️'];
    const c1 = choices[Math.floor(Math.random() * 3)];
    const c2 = choices[Math.floor(Math.random() * 3)];

    let winner = null;
    if (c1 === c2) winner = null;
    else if (
      (c1.includes('Pierre') && c2.includes('Ciseau')) ||
      (c1.includes('Feuille') && c2.includes('Pierre')) ||
      (c1.includes('Ciseau') && c2.includes('Feuille'))
    ) winner = message.author;
    else winner = target;

    let desc;
    if (!winner) {
      desc = `🤝 **Égalité !** Les deux joueurs gardent leur mise.`;
    } else {
      removeBalance(winner.id === message.author.id ? target.id : message.author.id, bet);
      addBalance(winner.id, bet);
      desc = `🏆 **${winner.username}** remporte **${bet.toLocaleString()} coins** !`;
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('✊📄✂️ Pierre Feuille Ciseau')
      .setDescription(
        `**${message.author.username}** : ${c1}\n**${target.username}** : ${c2}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${desc}`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Économie' });

    message.reply({ embeds: [embed] });
  },
};

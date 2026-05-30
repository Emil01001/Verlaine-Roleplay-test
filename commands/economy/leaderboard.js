const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'classement'],
  description: 'Classement des joueurs les plus riches',
  usage: '-leaderboard',

  async execute(message) {
    const rows = db.prepare('SELECT user_id, balance, bank FROM economy ORDER BY (balance+bank) DESC LIMIT 10').all();
    if (!rows.length) return message.reply('❌ Aucun joueur dans le classement.');

    const medals = ['🥇', '🥈', '🥉'];
    const fields = [];

    for (let i = 0; i < rows.length; i++) {
      const user = await message.client.users.fetch(rows[i].user_id).catch(() => null);
      const name = user ? user.username : `Inconnu (${rows[i].user_id})`;
      const total = rows[i].balance + rows[i].bank;
      fields.push(`${medals[i] || `**${i+1}.**`} **${name}** — ${total.toLocaleString()} coins`);
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('🏆 Classement — Top 10 plus riches')
      .setDescription(fields.join('\n\n'))
      .setFooter({ text: `Verlaine Rôleplay • Économie`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

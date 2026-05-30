const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, getMines, db } = require('../../database/db');
const config = require('../../config');

const ores = [
  { name: 'Charbon', key: 'charbon', emoji: '🪨', value: 10, chance: 0.45 },
  { name: 'Fer', key: 'fer', emoji: '⚙️', value: 30, chance: 0.30 },
  { name: 'Or', key: 'or', emoji: '🏅', value: 80, chance: 0.18 },
  { name: 'Diamant', key: 'diamant', emoji: '💎', value: 250, chance: 0.07 },
];

module.exports = {
  name: 'mine',
  description: 'Miner des minerais (nécessite un wagon)',
  usage: '-mine',

  async execute(message) {
    const eco = getEconomy(message.author.id);
    if (!eco.has_wagon) {
      return message.reply('❌ Tu as besoin d\'un **wagon** pour miner ! Achète-en un avec `-buy wagon`.');
    }

    const mines = getMines(message.author.id);
    const now = Date.now();
    const cooldown = 1800000;

    if (now < mines.last_mine + cooldown) {
      const r = Math.ceil((mines.last_mine + cooldown - now) / 60000);
      return message.reply(`⏳ La mine se recharge ! Reviens dans **${r} minute(s)**.`);
    }

    const mined = [];
    for (const ore of ores) {
      if (Math.random() < ore.chance) {
        const qty = Math.floor(Math.random() * 3) + 1;
        mined.push({ ...ore, qty });
      }
    }

    if (mined.length === 0) {
      db.prepare('UPDATE mines SET last_mine = ? WHERE user_id = ?').run(now, message.author.id);
      return message.reply('😞 Aucun minerai trouvé cette fois-ci. Reviens dans 30 minutes !');
    }

    const updates = {};
    for (const m of mined) {
      updates[m.key] = (mines[m.key] || 0) + m.qty;
    }
    const keys = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE mines SET ${keys}, last_mine = ? WHERE user_id = ?`).run(...Object.values(updates), now, message.author.id);

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('⛏️ Session de minage terminée !')
      .setDescription(
        `**${message.author.username}** a miné :\n\n` +
        mined.map(m => `${m.emoji} **${m.qty}x ${m.name}**`).join('\n') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Vends tes minerais avec \`-mine vendre\` quand tu en as **5 de chaque** !`
      )
      .addFields(
        ores.map(o => ({
          name: `${o.emoji} ${o.name}`,
          value: `${updates[o.key] || mines[o.key] || 0}/5`,
          inline: true,
        }))
      )
      .setFooter({ text: 'Verlaine Rôleplay • Économie' });

    message.reply({ embeds: [embed] });
  },
};

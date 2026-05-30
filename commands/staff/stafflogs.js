const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'stafflogs',
  aliases: ['logs', 'modlogs'],
  description: 'Voir les logs du staff',
  usage: '-stafflogs [@utilisateur]',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.users.first();
    const rows = target
      ? db.prepare('SELECT * FROM staff_logs WHERE staff_id = ? ORDER BY timestamp DESC LIMIT 10').all(target.id)
      : db.prepare('SELECT * FROM staff_logs ORDER BY timestamp DESC LIMIT 15').all();

    if (!rows.length) return message.reply('❌ Aucun log trouvé.');

    const embed = new EmbedBuilder().setColor(config.colors.staff)
      .setTitle(`📋 Logs Staff${target ? ` — ${target.username}` : ''}`)
      .setDescription(rows.map(r =>
        `**${r.action.toUpperCase()}** | <@${r.staff_id}> → <@${r.target_id}>\n*${r.reason}* — <t:${Math.floor(r.timestamp/1000)}:R>`
      ).join('\n\n'))
      .setFooter({ text: 'Verlaine Rôleplay • Staff Logs' }).setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

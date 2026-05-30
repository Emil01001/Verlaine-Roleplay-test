const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'staffinfo',
  aliases: ['staff'],
  description: 'Voir les statistiques d\'un membre du staff',
  usage: '-staffinfo [@staff]',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.users.first() || message.author;

    const logs = db.prepare('SELECT action, COUNT(*) as count FROM staff_logs WHERE staff_id = ? GROUP BY action').all(target.id);
    const total = db.prepare('SELECT COUNT(*) as count FROM staff_logs WHERE staff_id = ?').get(target.id)?.count || 0;

    const embed = new EmbedBuilder().setColor(config.colors.staff)
      .setTitle(`👮 Stats Staff — ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(
        total === 0 ? '*Aucune action enregistrée.*' :
        logs.map(l => `**${l.action.toUpperCase()} :** ${l.count}`).join('\n')
      )
      .addFields({ name: '📊 Total actions', value: `${total}`, inline: true })
      .setFooter({ text: 'Verlaine Rôleplay • Staff' }).setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

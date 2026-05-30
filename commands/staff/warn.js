const { EmbedBuilder } = require('discord.js');
const { addWarning, getWarnings, db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'warn',
  description: 'Avertir un membre',
  usage: '-warn <@utilisateur> <raison>',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply('❌ Fournis une raison.');

    addWarning(target.id, message.author.id, reason);

    const result = db.prepare('INSERT INTO cases (guild_id, user_id, staff_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      message.guild.id, target.id, message.author.id, 'Avertissement', reason, Date.now()
    );
    const caseNum = result.lastInsertRowid;

    const warns = getWarnings(target.id);

    const embed = new EmbedBuilder().setColor(config.colors.warning)
      .setTitle('⚠️ Avertissement')
      .setDescription(`**${target.tag}** a reçu un avertissement.\n**Raison :** ${reason}\n**Case :** #${caseNum}\n**Total warns :** ${warns.length}`)
      .setFooter({ text: `Staff: ${message.author.tag}` }).setTimestamp();
    message.reply({ embeds: [embed] });

    // DM matching screenshot style
    const dmEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(`⚠️ | Sanction sur ${message.guild.name}`)
      .setDescription('Tu as reçu une sanction.')
      .addFields(
        { name: 'Action :', value: 'Avertissement', inline: false },
        { name: 'Case :', value: `#${caseNum}`, inline: false },
        { name: 'Raison :', value: reason, inline: false },
      )
      .setFooter({ text: `${message.guild.name} | ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

    target.send({ embeds: [dmEmbed] }).catch(() => {});
  },
};

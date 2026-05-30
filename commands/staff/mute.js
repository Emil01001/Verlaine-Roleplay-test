const { EmbedBuilder } = require('discord.js');
const { addStaffLog, db } = require('../../database/db');
const config = require('../../config');
const ms = require('ms');

module.exports = {
  name: 'mute',
  aliases: ['timeout'],
  description: 'Mettre en timeout un membre',
  usage: '-mute <@utilisateur> <durée> [raison]',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    const durationStr = args[1] || '5m';
    const duration = ms(durationStr);
    if (!duration) return message.reply('❌ Durée invalide. Ex: `5m`, `1h`, `1d`');
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

    const result = db.prepare('INSERT INTO cases (guild_id, user_id, staff_id, action, reason, duration, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      message.guild.id, target.id, message.author.id, 'Timeout', reason, duration, Date.now()
    );
    const caseNum = result.lastInsertRowid;

    await target.timeout(duration, reason);
    addStaffLog(message.author.id, target.id, 'mute', reason, duration);

    // Staff channel embed
    const embed = new EmbedBuilder().setColor(config.colors.warning)
      .setTitle('🔇 Membre muté')
      .setDescription(`**${target.user.tag}** a été muté pendant **${durationStr}**.\n**Raison :** ${reason}\n**Case :** #${caseNum}`)
      .setFooter({ text: `Staff: ${message.author.tag}` }).setTimestamp();
    message.reply({ embeds: [embed] });

    // DM matching screenshot style
    const dmEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(`⚠️ | Sanction sur ${message.guild.name}`)
      .setDescription('Tu as reçu une sanction.')
      .addFields(
        { name: 'Action :', value: 'Timeout', inline: false },
        { name: 'Case :', value: `#${caseNum}`, inline: false },
        { name: 'Raison :', value: reason, inline: false },
        { name: 'Durée :', value: durationStr, inline: false },
      )
      .setFooter({ text: `${message.guild.name} | ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

    target.user.send({ embeds: [dmEmbed] }).catch(() => {});
  },
};

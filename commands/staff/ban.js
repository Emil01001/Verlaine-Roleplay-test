const { EmbedBuilder } = require('discord.js');
const { addStaffLog, db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'ban',
  description: 'Bannir un membre du serveur',
  usage: '-ban <@utilisateur> [raison]',
  async execute(message, args) {
    if (!message.member.permissions.has('BanMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (!target.bannable) return message.reply('❌ Impossible de bannir ce membre.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    // Insert case and get case number
    const result = db.prepare('INSERT INTO cases (guild_id, user_id, staff_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      message.guild.id, target.id, message.author.id, 'Ban', reason, Date.now()
    );
    const caseNum = result.lastInsertRowid;

    await target.ban({ reason, deleteMessageSeconds: 86400 });
    addStaffLog(message.author.id, target.id, 'ban', reason);

    // Staff channel embed
    const embed = new EmbedBuilder().setColor(config.colors.error)
      .setTitle('🔨 Membre banni')
      .setDescription(`**${target.user.tag}** a été banni.\n**Raison :** ${reason}\n**Case :** #${caseNum}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Staff: ${message.author.tag}` }).setTimestamp();
    message.reply({ embeds: [embed] });

    // DM format matching screenshot
    const dmEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(`⚠️ | Sanction sur ${message.guild.name}`)
      .setDescription('Tu as reçu une sanction.')
      .addFields(
        { name: 'Action :', value: 'Ban', inline: false },
        { name: 'Case :', value: `#${caseNum}`, inline: false },
        { name: 'Raison :', value: reason, inline: false },
      )
      .setFooter({ text: `${message.guild.name} | ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

    target.user.send({ embeds: [dmEmbed] }).catch(() => {});
  },
};

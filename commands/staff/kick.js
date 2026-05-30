const { EmbedBuilder } = require('discord.js');
const { addStaffLog, db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'kick',
  description: 'Expulser un membre',
  usage: '-kick <@utilisateur> [raison]',
  async execute(message, args) {
    if (!message.member.permissions.has('KickMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (!target.kickable) return message.reply('❌ Impossible d\'expulser ce membre.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    const result = db.prepare('INSERT INTO cases (guild_id, user_id, staff_id, action, reason, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
      message.guild.id, target.id, message.author.id, 'Kick', reason, Date.now()
    );
    const caseNum = result.lastInsertRowid;

    // DM before kick
    const dmEmbed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle(`⚠️ | Sanction sur ${message.guild.name}`)
      .setDescription('Tu as reçu une sanction.')
      .addFields(
        { name: 'Action :', value: 'Kick', inline: false },
        { name: 'Case :', value: `#${caseNum}`, inline: false },
        { name: 'Raison :', value: reason, inline: false },
      )
      .setFooter({ text: `${message.guild.name} | ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    await target.user.send({ embeds: [dmEmbed] }).catch(() => {});

    await target.kick(reason);
    addStaffLog(message.author.id, target.id, 'kick', reason);

    const embed = new EmbedBuilder().setColor(config.colors.warning)
      .setTitle('👢 Membre expulsé')
      .setDescription(`**${target.user.tag}** a été expulsé.\n**Raison :** ${reason}\n**Case :** #${caseNum}`)
      .setFooter({ text: `Staff: ${message.author.tag}` }).setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

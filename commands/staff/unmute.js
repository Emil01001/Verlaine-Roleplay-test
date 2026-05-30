const { EmbedBuilder } = require('discord.js');
const { addStaffLog, db } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'unmute',
  description: 'Retirer le timeout d\'un membre',
  usage: '-unmute <@utilisateur> [raison]',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    await target.timeout(null, reason);
    addStaffLog(message.author.id, target.id, 'unmute', reason);

    const embed = new EmbedBuilder().setColor(config.colors.success)
      .setTitle('🔊 Membre dé-muté')
      .setDescription(`**${target.user.tag}** n'est plus en timeout.\n**Raison :** ${reason}`)
      .setFooter({ text: `Staff: ${message.author.tag}` }).setTimestamp();
    message.reply({ embeds: [embed] });

    // DM matching screenshot style (timeout révoqué)
    const dmEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('[Timeout révoqué]')
      .setDescription('Votre timeout a été levé sur ce serveur.')
      .addFields(
        { name: 'Serveur', value: message.guild.name, inline: false },
        { name: 'Modérateur', value: message.author.username, inline: false },
        { name: 'Raison', value: reason, inline: false },
      )
      .setFooter({ text: `${message.guild.name} | ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

    target.user.send({ embeds: [dmEmbed] }).catch(() => {});
  },
};

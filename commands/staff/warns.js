const { EmbedBuilder } = require('discord.js');
const { getWarnings } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'warns',
  aliases: ['avertissements'],
  description: 'Voir les avertissements d\'un membre',
  usage: '-warns <@utilisateur>',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply('❌ Permission insuffisante.');
    const target = message.mentions.users.first() || message.author;
    const warns = getWarnings(target.id);

    const embed = new EmbedBuilder().setColor(config.colors.warning)
      .setTitle(`⚠️ Avertissements — ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(
        warns.length === 0 ? '✅ Aucun avertissement.' :
        warns.map((w, i) => `**${i+1}.** ${w.reason}\n*Par <@${w.staff_id}> le <t:${Math.floor(w.timestamp/1000)}:d>*`).join('\n\n')
      )
      .setFooter({ text: `Total: ${warns.length} avertissement(s) | Verlaine Rôleplay` });
    message.reply({ embeds: [embed] });
  },
};

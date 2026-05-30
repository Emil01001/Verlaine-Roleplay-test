const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'userinfo',
  aliases: ['whois', 'ui'],
  description: 'Voir les infos d\'un utilisateur',
  usage: '-userinfo [@utilisateur]',
  async execute(message, args) {
    const target = message.mentions.members.first() || message.member;
    const roles = target.roles.cache.filter(r => r.id !== message.guild.id).sort((a,b) => b.position - a.position).map(r => `${r}`).slice(0,10).join(' ') || 'Aucun rôle';

    const embed = new EmbedBuilder().setColor(target.displayHexColor || config.colors.info)
      .setTitle(`👤 ${target.user.username}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: target.id, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(target.user.createdTimestamp/1000)}:D>`, inline: true },
        { name: '📥 Rejoint le', value: `<t:${Math.floor(target.joinedTimestamp/1000)}:D>`, inline: true },
        { name: '🎭 Pseudo', value: target.displayName, inline: true },
        { name: '🤖 Bot', value: target.user.bot ? 'Oui' : 'Non', inline: true },
        { name: '💎 Booster', value: target.premiumSince ? `<t:${Math.floor(target.premiumSinceTimestamp/1000)}:D>` : 'Non', inline: true },
        { name: `🎖️ Rôles (${target.roles.cache.size - 1})`, value: roles, inline: false },
      )
      .setFooter({ text: 'Verlaine Rôleplay', iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

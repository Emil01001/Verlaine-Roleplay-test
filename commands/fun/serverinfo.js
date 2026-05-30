const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'serverinfo',
  aliases: ['si', 'serveur'],
  description: 'Informations sur le serveur',
  usage: '-serverinfo',
  async execute(message) {
    const guild = message.guild;
    await guild.members.fetch();
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;
    const online = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;

    const embed = new EmbedBuilder().setColor(config.colors.info)
      .setTitle(`🏰 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:D>`, inline: true },
        { name: '👥 Membres', value: `Total: **${guild.memberCount}**\nHumains: **${humans}**\nBots: **${bots}**`, inline: true },
        { name: '💬 Salons', value: `Texte: **${guild.channels.cache.filter(c=>c.type===0).size}**\nVocal: **${guild.channels.cache.filter(c=>c.type===2).size}**`, inline: true },
        { name: '💎 Boosts', value: `**${guild.premiumSubscriptionCount || 0}** boosts\nNiveau **${guild.premiumTier}**`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😄 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🔒 Vérification', value: guild.verificationLevel.toString(), inline: true },
      )
      .setFooter({ text: 'Verlaine Rôleplay', iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};

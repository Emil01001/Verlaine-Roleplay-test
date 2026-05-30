const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const channel = member.guild.channels.cache.find(c => c.name && c.name.toLowerCase().includes('au revoir') || c.name?.toLowerCase().includes('goodbye'));
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle('👋 Au revoir !')
      .setDescription(`**${member.user.username}** vient de quitter le serveur.\nNous espérons vous revoir bientôt !`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • ${member.guild.memberCount} membres restants`, iconURL: member.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
  },
};

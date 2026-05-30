const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { db } = require('../database/db');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember, client) {
    const wasBooster = oldMember.premiumSince;
    const isBooster = newMember.premiumSince;

    if (!wasBooster && isBooster) {
      const channel = newMember.guild.channels.cache.find(c =>
        c.name?.toLowerCase().includes('boost')
      );
      if (!channel) return;

      db.prepare('INSERT INTO boosts (user_id, timestamp) VALUES (?, ?)').run(newMember.id, Date.now());
      const totalBoosts = newMember.guild.premiumSubscriptionCount || 0;

      const embed = new EmbedBuilder()
        .setColor(config.colors.boost)
        .setTitle('<:boost:1505190484992069682> Nouveau boost !')
        .setDescription(
          `Merci **${newMember.user.username}** d'avoir boosté **Verlaine Rôleplay** ! 🗼\n` +
          `Grâce à toi le serveur grandit encore plus !\n\n` +
          `**Total boosts :** ${totalBoosts} | <t:${Math.floor(Date.now() / 1000)}:f>`
        )
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: `Verlaine Rôleplay • Boosts`, iconURL: newMember.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      await channel.send({ content: `${newMember}`, embeds: [embed] }).catch(() => {});
    }
  },
};

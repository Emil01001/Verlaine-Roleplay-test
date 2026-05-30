const { EmbedBuilder } = require('discord.js');
const { getRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'rpmoney',
  aliases: ['argent-rp', 'solde-rp'],
  description: 'Voir votre solde RP',
  usage: '-rpmoney [@utilisateur]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const p = getRpProfile(target.id);
    const embed = new EmbedBuilder().setColor(config.colors.rp)
      .setTitle(`💶 Solde RP — ${target.username}`)
      .addFields(
        { name: '💵 Liquide', value: `${(p.money||0).toLocaleString()} €`, inline: true },
        { name: '💼 Métier', value: p.job || 'Sans emploi', inline: true },
        { name: '⭐ Niveau', value: `${p.level} (${p.xp}/100 XP)`, inline: true },
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

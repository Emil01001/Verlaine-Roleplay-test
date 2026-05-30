const { EmbedBuilder } = require('discord.js');
const { getRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'niveau',
  aliases: ['level', 'xp'],
  description: 'Voir votre niveau RP',
  usage: '-niveau [@utilisateur]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const p = getRpProfile(target.id);
    const progress = Math.floor((p.xp/100)*20);
    const bar = '█'.repeat(progress) + '░'.repeat(20-progress);

    const embed = new EmbedBuilder().setColor(config.colors.rp)
      .setTitle(`⭐ Niveau RP — ${target.username}`)
      .setDescription(`**Niveau ${p.level}**\n\`[${bar}]\` ${p.xp}/100 XP`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'slowmode',
  aliases: ['sm'],
  description: 'Définir le mode lent d\'un salon',
  usage: '-slowmode <secondes>',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageChannels')) return message.reply('❌ Permission insuffisante.');
    const secs = parseInt(args[0]) || 0;
    if (secs < 0 || secs > 21600) return message.reply('❌ Entre 0 et 21600 secondes.');
    await message.channel.setRateLimitPerUser(secs);
    const embed = new EmbedBuilder().setColor(config.colors.info)
      .setDescription(`⏱️ Slowmode : **${secs === 0 ? 'désactivé' : secs + ' secondes'}** dans ${message.channel}`)
      .setFooter({ text: `Par ${message.author.tag}` });
    message.reply({ embeds: [embed] });
  },
};

const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'announce',
  aliases: ['annonce'],
  description: 'Envoyer une annonce formatée',
  usage: '-announce <#salon> <titre> | <message>',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('❌ Mentionne un salon.');

    const content = args.slice(1).join(' ');
    const [title, ...bodyParts] = content.split('|');
    const body = bodyParts.join('|').trim();
    if (!title || !body) return message.reply('❌ Format: `-announce #salon <titre> | <message>`');

    await message.delete().catch(() => {});
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`📢 ${title.trim()}`)
      .setDescription(body)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • Annonce`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();
    channel.send({ content: `<@&${config.roles.notifAnnonce}>`, embeds: [embed] });
  },
};

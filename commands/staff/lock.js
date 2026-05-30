const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'lock',
  description: 'Verrouiller / déverrouiller un salon',
  usage: '-lock [#salon]',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageChannels')) return message.reply('❌ Permission insuffisante.');
    const channel = message.mentions.channels.first() || message.channel;
    const isLocked = !channel.permissionsFor(message.guild.roles.everyone).has(PermissionFlagsBits.SendMessages);

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: isLocked ? null : false,
    });

    const embed = new EmbedBuilder()
      .setColor(isLocked ? config.colors.success : config.colors.error)
      .setDescription(`${isLocked ? '🔓 Salon **déverrouillé**' : '🔒 Salon **verrouillé**'} : ${channel}`)
      .setFooter({ text: `Par ${message.author.tag}` });
    message.reply({ embeds: [embed] });
  },
};

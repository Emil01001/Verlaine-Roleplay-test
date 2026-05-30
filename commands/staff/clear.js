const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'clear',
  aliases: ['purge', 'supprimer'],
  description: 'Supprimer des messages en masse',
  usage: '-clear <1-100>',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) return message.reply('❌ Nombre entre 1 et 100.');

    await message.delete().catch(() => {});
    const deleted = await message.channel.bulkDelete(amount, true).catch(() => null);

    const embed = new EmbedBuilder().setColor(config.colors.success)
      .setDescription(`🗑️ **${deleted?.size || 0}** message(s) supprimé(s).`)
      .setFooter({ text: `Par ${message.author.tag}` });
    const m = await message.channel.send({ embeds: [embed] });
    setTimeout(() => m.delete().catch(() => {}), 3000);
  },
};

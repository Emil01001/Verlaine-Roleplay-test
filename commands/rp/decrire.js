const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'decrire',
  aliases: ['describe', 'action'],
  description: 'Décrire une action RP dans le salon',
  usage: '-decrire <action>',
  async execute(message, args) {
    const text = args.join(' ');
    if (!text) return message.reply('❌ Décris une action. Ex: `-decrire monte dans sa voiture`');
    await message.delete().catch(() => {});
    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setDescription(`*${message.author.username} ${text}*`)
      .setFooter({ text: `Verlaine Rôleplay • RP` });
    message.channel.send({ embeds: [embed] });
  },
};

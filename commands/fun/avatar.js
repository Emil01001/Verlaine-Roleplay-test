const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'avatar',
  aliases: ['pfp', 'photo'],
  description: 'Voir l\'avatar d\'un utilisateur',
  usage: '-avatar [@utilisateur]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder().setColor(config.colors.info)
      .setTitle(`🖼️ Avatar de ${target.username}`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: 'Verlaine Rôleplay' });
    message.reply({ embeds: [embed] });
  },
};

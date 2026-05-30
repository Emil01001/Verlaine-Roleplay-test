const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'giverpmoney',
  aliases: ['addrpmoney'],
  description: 'Donner de l\'argent RP à un joueur (Admin)',
  usage: '-giverpmoney <@utilisateur> <montant>',
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('❌ Admin seulement.');
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target || isNaN(amount)) return message.reply('❌ Usage: `-giverpmoney <@user> <montant>`');
    const p = getRpProfile(target.id);
    updateRpProfile(target.id, { money: (p.money||0) + amount });
    const embed = new EmbedBuilder().setColor(amount > 0 ? config.colors.success : config.colors.error)
      .setDescription(`💶 **${amount > 0 ? '+' : ''}${amount} €** RP ${amount > 0 ? 'ajoutés à' : 'retirés à'} **${target.username}**.`)
      .setFooter({ text: `Par ${message.author.tag}` });
    message.reply({ embeds: [embed] });
  },
};

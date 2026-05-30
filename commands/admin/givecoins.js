const { EmbedBuilder } = require('discord.js');
const { addBalance, removeBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'givecoins',
  aliases: ['addcoins', 'donnecoins'],
  description: 'Donner/retirer des coins à un joueur (Admin)',
  usage: '-givecoins <@utilisateur> <+/-montant>',
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('❌ Admin seulement.');
    const target = message.mentions.users.first();
    const amountStr = args[1];
    if (!target || !amountStr) return message.reply('❌ Usage: `-givecoins <@user> <+/-montant>`');

    const amount = parseInt(amountStr);
    if (isNaN(amount)) return message.reply('❌ Montant invalide.');

    if (amount > 0) addBalance(target.id, amount);
    else removeBalance(target.id, Math.abs(amount));

    const embed = new EmbedBuilder().setColor(amount > 0 ? config.colors.success : config.colors.error)
      .setDescription(`${amount > 0 ? '💰' : '💸'} **${amount > 0 ? '+' : ''}${amount} coins** ${amount > 0 ? 'ajoutés à' : 'retirés à'} **${target.username}**.`)
      .setFooter({ text: `Par ${message.author.tag}` });
    message.reply({ embeds: [embed] });
  },
};

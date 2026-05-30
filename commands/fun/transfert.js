const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'give',
  aliases: ['transfert', 'donner'],
  description: 'Donner des coins à un joueur',
  usage: '-give <@utilisateur> <montant>',
  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target||target.bot||target.id===message.author.id) return message.reply('❌ Cible invalide.');
    if (!amount||amount<1) return message.reply('❌ Montant invalide.');
    const eco = getEconomy(message.author.id);
    if (eco.balance<amount) return message.reply('❌ Solde insuffisant !');
    removeBalance(message.author.id, amount);
    addBalance(target.id, amount);
    const embed = new EmbedBuilder().setColor(config.colors.success)
      .setDescription(`✅ **${message.author.username}** a donné **${amount.toLocaleString()} coins** à **${target.username}** !`)
      .setFooter({ text: 'Verlaine Rôleplay • Économie' });
    message.reply({ embeds: [embed] });
  },
};

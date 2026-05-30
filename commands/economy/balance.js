const { EmbedBuilder } = require('discord.js');
const { getEconomy } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'money', 'argent', 'coins'],
  description: 'Voir votre solde de coins',
  usage: '-balance [@utilisateur]',

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const eco = getEconomy(target.id);
    const total = eco.balance + eco.bank;

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle(`💰 Solde de ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👝 Portefeuille', value: `**${eco.balance.toLocaleString()}** coins`, inline: true },
        { name: '🏦 Banque', value: `**${eco.bank.toLocaleString()}** coins`, inline: true },
        { name: '💎 Total', value: `**${total.toLocaleString()}** coins`, inline: true },
        { name: '📈 Total gagné', value: `${eco.total_earned.toLocaleString()} coins`, inline: true },
        { name: '📉 Total perdu', value: `${eco.total_lost.toLocaleString()} coins`, inline: true },
        { name: '🔒 Anti-Rob', value: eco.has_antirob ? '✅ Actif' : '❌ Inactif', inline: true },
      )
      .setFooter({ text: `Verlaine Rôleplay • Économie`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'banque',
  aliases: ['bank-rp', 'banquerp'],
  description: 'Gérer votre compte bancaire RP',
  usage: '-banque [depot <montant>|retrait <montant>|solde]',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase() || 'solde';
    const amount = parseInt(args[1]);
    const p = getRpProfile(message.author.id);

    if (sub === 'solde') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🏦 Banque RP — Votre Compte')
        .addFields(
          { name: '💵 Argent liquide', value: `${p.money?.toLocaleString()||0} €`, inline: true },
        )
        .setFooter({ text: 'Verlaine Rôleplay • Banque RP' });
      return message.reply({ embeds: [embed] });
    }

    if (!amount || amount <= 0) return message.reply('❌ Montant invalide.');

    if (sub === 'depot') {
      if (p.money < amount) return message.reply(`❌ Liquidités insuffisantes (${p.money||0} €).`);
      updateRpProfile(message.author.id, { money: (p.money||0) - amount });
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setDescription(`🏦 **Dépôt** de **${amount.toLocaleString()} €** effectué !`)
        .setFooter({ text: 'Verlaine Rôleplay • Banque RP' });
      return message.reply({ embeds: [embed] });
    }
  },
};

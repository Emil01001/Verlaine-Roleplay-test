const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'donnerrp',
  aliases: ['payer', 'transfertrp'],
  description: 'Donner de l\'argent RP à un joueur',
  usage: '-donnerrp <@utilisateur> <montant>',
  async execute(message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target||target.bot||target.id===message.author.id) return message.reply('❌ Cible invalide.');
    if (!amount||amount<1) return message.reply('❌ Montant invalide.');
    const p = getRpProfile(message.author.id);
    if ((p.money||0)<amount) return message.reply('❌ Solde RP insuffisant !');
    updateRpProfile(message.author.id, { money: (p.money||0)-amount });
    const tp = getRpProfile(target.id);
    updateRpProfile(target.id, { money: (tp.money||0)+amount });
    const embed = new EmbedBuilder().setColor(config.colors.success)
      .setDescription(`✅ **${message.author.username}** a transféré **${amount.toLocaleString()} €** RP à **${target.username}** !`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

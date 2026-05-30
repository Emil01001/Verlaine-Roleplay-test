const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'hopital',
  aliases: ['hospital', 'soins'],
  description: 'Se faire soigner à l\'hôpital',
  usage: '-hopital',

  async execute(message, args) {
    const p = getRpProfile(message.author.id);
    if (p.health >= 100) return message.reply('✅ Tu es déjà en pleine santé (100/100) !');

    const healCost = Math.floor((100-p.health) * 15);
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🏥 Hôpital — Verlaine Rôleplay')
        .setDescription(
          `**Santé actuelle :** ${p.health}/100\n` +
          `**Coût pour guérir complètement :** ${healCost.toLocaleString()} €\n\n` +
          `Utilise \`-hopital soigner\` pour te faire soigner.`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Hôpital' });
      return message.reply({ embeds: [embed] });
    }

    if (args[0] === 'soigner') {
      if (p.money < healCost) return message.reply(`❌ Solde RP insuffisant ! Il te faut **${healCost.toLocaleString()} €**.`);
      updateRpProfile(message.author.id, { health: 100, money: p.money - healCost });
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Soins terminés !')
        .setDescription(`Tu es maintenant en pleine santé (100/100) !\n\n💸 Coût des soins : **-${healCost.toLocaleString()} €**`)
        .setFooter({ text: 'Verlaine Rôleplay • Hôpital' });
      return message.reply({ embeds: [embed] });
    }
  },
};

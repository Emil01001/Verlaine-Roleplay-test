const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'boire',
  aliases: ['drink', 'eau'],
  description: 'Boire pour récupérer de la soif',
  usage: '-boire',
  cooldown: 20,
  async execute(message) {
    const p = getRpProfile(message.author.id);
    if (p.thirst >= 100) return message.reply('✅ Tu n\'as pas soif (100/100) !');
    if ((p.money||0) < 10) return message.reply('❌ Il te faut **10 €** RP pour boire.');
    const newThirst = Math.min(100, (p.thirst||50)+30);
    updateRpProfile(message.author.id, { thirst: newThirst, money: (p.money||0)-10 });
    const embed = new EmbedBuilder().setColor(config.colors.info)
      .setDescription(`💧 **${message.author.username}** boit (-10 €)\n📊 Soif : **${newThirst}/100**`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

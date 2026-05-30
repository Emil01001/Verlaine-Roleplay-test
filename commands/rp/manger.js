const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

const foods = ['🍕 Pizza','🍔 Burger','🥗 Salade','🍜 Ramen','🌮 Taco','🍣 Sushi','🥩 Steak','🍰 Gâteau'];

module.exports = {
  name: 'manger',
  aliases: ['eat', 'nourriture'],
  description: 'Manger pour récupérer de la faim',
  usage: '-manger',
  cooldown: 30,
  async execute(message) {
    const p = getRpProfile(message.author.id);
    if (p.hunger >= 100) return message.reply('✅ Tu n\'as pas faim pour l\'instant (100/100) !');
    if ((p.money||0) < 20) return message.reply('❌ Il te faut **20 €** RP pour manger.');
    const food = foods[Math.floor(Math.random()*foods.length)];
    const newHunger = Math.min(100, (p.hunger||50)+30);
    updateRpProfile(message.author.id, { hunger: newHunger, money: (p.money||0)-20 });
    const embed = new EmbedBuilder().setColor(config.colors.success)
      .setDescription(`🍽️ **${message.author.username}** mange **${food}** (-20 €)\n📊 Faim : **${newHunger}/100**`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

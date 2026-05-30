const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');
const cooldowns = new Map();

module.exports = {
  name: 'dormir',
  aliases: ['sleep', 'repos'],
  description: 'Dormir pour récupérer de la santé',
  usage: '-dormir',
  async execute(message) {
    const now = Date.now();
    if (cooldowns.has(message.author.id) && now < cooldowns.get(message.author.id)) {
      return message.reply(`⏳ Tu t'es déjà reposé récemment. Attend <t:${Math.floor(cooldowns.get(message.author.id)/1000)}:R>.`);
    }
    const p = getRpProfile(message.author.id);
    const newHealth = Math.min(100, (p.health||100)+20);
    updateRpProfile(message.author.id, { health: newHealth });
    cooldowns.set(message.author.id, now+7200000);
    const embed = new EmbedBuilder().setColor(config.colors.rp)
      .setDescription(`😴 **${message.author.username}** dort et récupère.\n❤️ Santé : **${newHealth}/100** (+20)`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

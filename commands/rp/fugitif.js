const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');
const cooldowns = new Map();

module.exports = {
  name: 'fugitif',
  aliases: ['fuir', 'escape'],
  description: 'Tenter de fuir la police et réduire le wanted',
  usage: '-fugitif',
  async execute(message) {
    const p = getRpProfile(message.author.id);
    if (!p.wanted || p.wanted <= 0) return message.reply('✅ Tu n\'as aucun niveau wanted !');
    const now = Date.now();
    if (cooldowns.has(message.author.id) && now < cooldowns.get(message.author.id)) {
      return message.reply(`⏳ Tu es encore épuisé de ta dernière fuite !`);
    }
    cooldowns.set(message.author.id, now+3600000);

    const success = Math.random() < (0.7 - p.wanted * 0.1);
    if (success) {
      const newWanted = Math.max(0, p.wanted-1);
      updateRpProfile(message.author.id, { wanted: newWanted });
      const embed = new EmbedBuilder().setColor(config.colors.success)
        .setTitle('🏃 Fuite réussie !')
        .setDescription(`Tu as semé les forces de l'ordre !\n⭐ Wanted : **${p.wanted}** → **${newWanted}**`)
        .setFooter({ text: 'Verlaine Rôleplay • RP' });
      return message.reply({ embeds: [embed] });
    }

    const jailTime = Date.now() + (p.wanted * 60000 * 5);
    updateRpProfile(message.author.id, { jail_until: jailTime, wanted: 0 });
    const embed = new EmbedBuilder().setColor(config.colors.error)
      .setTitle('🚔 Arrêté !')
      .setDescription(`Tu t'es fait rattraper et arrêter !\n🔒 En prison jusqu'à <t:${Math.floor(jailTime/1000)}:R>.`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

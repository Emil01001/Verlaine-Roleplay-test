const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, setCooldown } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'slut',
  description: 'Coins gratuits si vous votez pour le bot',
  usage: '-slut',

  async execute(message) {
    const eco = getEconomy(message.author.id);
    const now = Date.now();

    if (now < eco.slut_cooldown) {
      const r = Math.ceil((eco.slut_cooldown - now) / 3600000);
      return message.reply(`⏳ Reviens dans **${r}h** ! N'oublie pas de voter d'abord.`);
    }

    const amount = Math.floor(Math.random() * 400) + 200;
    addBalance(message.author.id, amount);
    setCooldown(message.author.id, 'slut', now + config.economy.slutCooldown);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🗳️ Récompense de vote')
      .setDescription(
        `Merci d'avoir voté pour **Verlaine Rôleplay** ! 🎉\n\n` +
        `💰 Tu reçois **+${amount} coins** en récompense !\n\n` +
        `Reviens dans **12 heures** pour voter à nouveau.`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Économie' });

    message.reply({ embeds: [embed] });
  },
};

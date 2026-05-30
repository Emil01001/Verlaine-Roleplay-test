const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, setCooldown } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'daily',
  aliases: ['quotidien'],
  description: 'Récupérer vos coins quotidiens gratuits',
  usage: '-daily',

  async execute(message) {
    const eco = getEconomy(message.author.id);
    const now = Date.now();

    if (now < eco.daily_cooldown) {
      const remaining = Math.ceil((eco.daily_cooldown - now) / 1000 / 3600);
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setDescription(`⏳ Tu as déjà récupéré tes coins quotidiens ! Reviens dans **${remaining}h**.`)
        .setFooter({ text: 'Verlaine Rôleplay • Économie' });
      return message.reply({ embeds: [embed] });
    }

    const amount = Math.floor(Math.random() * (config.economy.dailyMax - config.economy.dailyMin + 1)) + config.economy.dailyMin;
    addBalance(message.author.id, amount);
    setCooldown(message.author.id, 'daily', now + config.economy.dailyCooldown);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🎁 Coins quotidiens récupérés !')
      .setDescription(
        `**${message.author.username}** a récupéré ses coins quotidiens !\n\n` +
        `💰 **+${amount} coins** ajoutés à votre portefeuille !\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Reviens demain pour récupérer de nouveaux coins !`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Économie', iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, removeBalance, setCooldown } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'rob',
  aliases: ['voler'],
  description: 'Voler des coins à un autre joueur',
  usage: '-rob <@utilisateur>',

  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target || target.bot || target.id === message.author.id) {
      return message.reply('❌ Mentionne un utilisateur valide à voler.');
    }

    const eco = getEconomy(message.author.id);
    const targetEco = getEconomy(target.id);
    const now = Date.now();

    if (now < eco.rob_cooldown) {
      const r = Math.ceil((eco.rob_cooldown - now) / 60000);
      return message.reply(`⏳ Tu es encore trop visible ! Attends **${r} minute(s)**.`);
    }

    if (targetEco.has_antirob) {
      setCooldown(message.author.id, 'rob', now + config.economy.robCooldown);
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('🛡️ Vol échoué !')
        .setDescription(`**${target.username}** possède un **Anti-Rob** ! Tu n'as pas pu voler.`)
        .setFooter({ text: 'Verlaine Rôleplay • Économie' });
      return message.reply({ embeds: [embed] });
    }

    if (targetEco.balance < 100) {
      return message.reply(`❌ **${target.username}** n'a pas assez de coins à voler (minimum 100).`);
    }

    setCooldown(message.author.id, 'rob', now + config.economy.robCooldown);
    const success = Math.random() < config.economy.robChance;

    if (success) {
      const stolen = Math.floor(targetEco.balance * (Math.random() * 0.3 + 0.1));
      removeBalance(target.id, stolen);
      addBalance(message.author.id, stolen);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🦹 Vol réussi !')
        .setDescription(
          `**${message.author.username}** a réussi à voler **${stolen.toLocaleString()} coins** à **${target.username}** !\n\n` +
          `*Les autorités n'ont rien vu...*`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Économie' });
      message.reply({ embeds: [embed] });
    } else {
      const fine = Math.floor(eco.balance * 0.15);
      removeBalance(message.author.id, fine);
      addBalance(target.id, fine);

      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setTitle('🚔 Vol échoué !')
        .setDescription(
          `**${message.author.username}** s'est fait attraper en tentant de voler **${target.username}** !\n\n` +
          `Tu as payé une amende de **${fine.toLocaleString()} coins** reversée à la victime.`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Économie' });
      message.reply({ embeds: [embed] });
    }
  },
};

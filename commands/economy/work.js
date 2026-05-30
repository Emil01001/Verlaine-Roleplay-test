const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, setCooldown } = require('../../database/db');
const config = require('../../config');

const jobs = [
  'Développeur', 'Mécanicien', 'Cuisinier', 'Chauffeur', 'Agent de sécurité',
  'Infirmier', 'Journaliste', 'Avocat', 'Architecte', 'Photographe',
  'Vendeur', 'Comptable', 'Ingénieur', 'Pompier', 'Policier',
];
const actions = [
  'a travaillé toute la journée', 'a terminé son shift', 'a fait des heures sup',
  'a conclu un contrat', 'a livré une commande', 'a réparé une panne',
  'a résolu un problème', 'a servi des clients', 'a géré des dossiers',
];

module.exports = {
  name: 'work',
  aliases: ['travailler', 'boulot'],
  description: 'Travailler pour gagner des coins',
  usage: '-work',

  async execute(message, args) {
    const eco = getEconomy(message.author.id);
    const now = Date.now();

    if (now < eco.work_cooldown) {
      const remaining = Math.ceil((eco.work_cooldown - now) / 1000 / 60);
      const embed = new EmbedBuilder()
        .setColor(config.colors.error)
        .setDescription(`⏳ Tu es épuisé ! Reviens dans **${remaining} minute(s)**.`)
        .setFooter({ text: 'Verlaine Rôleplay • Économie' });
      return message.reply({ embeds: [embed] });
    }

    const amount = Math.floor(Math.random() * (config.economy.workMax - config.economy.workMin + 1)) + config.economy.workMin;
    const job = eco.job || jobs[Math.floor(Math.random() * jobs.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    addBalance(message.author.id, amount);
    setCooldown(message.author.id, 'work', now + config.economy.workCooldown);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('💼 Travail terminé !')
      .setDescription(
        `**${message.author.username}**, en tant que **${job}**, ${action} et a gagné **+${amount} coins** ! 💰\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Prochain travail disponible dans **1 heure**.`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Économie', iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

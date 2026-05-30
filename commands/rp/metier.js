const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

const jobs = [
  { id: 'policier', name: 'Policier', emoji: '👮', salary: 800, desc: 'Maintenir l\'ordre public', require: 5 },
  { id: 'medecin', name: 'Médecin', emoji: '🩺', salary: 1200, desc: 'Soigner les citoyens', require: 8 },
  { id: 'pompier', name: 'Pompier', emoji: '🚒', salary: 900, desc: 'Secourir les victimes', require: 5 },
  { id: 'avocat', name: 'Avocat', emoji: '⚖️', salary: 1500, desc: 'Défendre ses clients', require: 10 },
  { id: 'chauffeur', name: 'Chauffeur', emoji: '🚕', salary: 400, desc: 'Transporter des passagers', require: 1 },
  { id: 'cuisinier', name: 'Cuisinier', emoji: '👨‍🍳', salary: 500, desc: 'Préparer des plats', require: 1 },
  { id: 'journaliste', name: 'Journaliste', emoji: '📰', salary: 600, desc: 'Couvrir l\'actualité', require: 3 },
  { id: 'mecanicien', name: 'Mécanicien', emoji: '🔧', salary: 550, desc: 'Réparer les véhicules', require: 2 },
  { id: 'dealer', name: 'Dealer (Illégal)', emoji: '💊', salary: 2000, desc: 'Commerce illégal (risqué)', require: 1 },
  { id: 'patron', name: 'Patron d\'entreprise', emoji: '🏢', salary: 3000, desc: 'Diriger une entreprise', require: 20 },
];

const salaryCD = new Map();

module.exports = {
  name: 'metier',
  aliases: ['job', 'emploi'],
  description: 'Gérer votre métier RP',
  usage: '-metier [liste|prendre <id>|salaire]',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase() || 'info';
    const p = getRpProfile(message.author.id);

    if (sub === 'liste') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('💼 Métiers disponibles — Verlaine Rôleplay')
        .setDescription(jobs.map(j => `${j.emoji} **${j.name}** (\`${j.id}\`)\n*${j.desc}* | Salaire: **${j.salary.toLocaleString()} €/h** | Niveau requis: ${j.require}`).join('\n\n'))
        .setFooter({ text: 'Prends un métier avec -metier prendre <id> | Verlaine RP' });
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'prendre') {
      const jobId = args[1]?.toLowerCase();
      const job = jobs.find(j => j.id === jobId);
      if (!job) return message.reply('❌ Métier introuvable. Utilise `-metier liste`.');
      if (p.level < job.require) return message.reply(`❌ Niveau ${job.require} requis (tu es niveau ${p.level}).`);
      updateRpProfile(message.author.id, { job: job.name });
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`${job.emoji} Nouveau métier !`)
        .setDescription(`Tu travailles maintenant en tant que **${job.name}** !\nSalaire : **${job.salary.toLocaleString()} €/h**`)
        .setFooter({ text: 'Verlaine Rôleplay • Métier' });
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'salaire') {
      if (!p.job) return message.reply('❌ Tu n\'as pas de métier ! Prends-en un avec `-metier prendre <id>`.');
      const now = Date.now();
      const jobData = jobs.find(j => j.name === p.job);
      if (!jobData) return message.reply('❌ Métier inconnu.');
      const cdKey = message.author.id;
      if (salaryCD.has(cdKey) && now < salaryCD.get(cdKey)) {
        return message.reply(`⏳ Prochain salaire disponible <t:${Math.floor(salaryCD.get(cdKey)/1000)}:R>.`);
      }
      salaryCD.set(cdKey, now + 3600000);
      updateRpProfile(message.author.id, { money: (p.money||0)+jobData.salary, xp: (p.xp||0)+5 });
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('💰 Salaire reçu !')
        .setDescription(`En tant que **${p.job}**, tu reçois **+${jobData.salary.toLocaleString()} €** RP !`)
        .setFooter({ text: 'Verlaine Rôleplay • Métier' });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setTitle('💼 Mon Métier')
      .setDescription(`**Métier actuel :** ${p.job || 'Aucun'}\n\n\`-metier liste\` — Voir tous les métiers\n\`-metier prendre <id>\` — Choisir un métier\n\`-metier salaire\` — Percevoir le salaire`)
      .setFooter({ text: 'Verlaine Rôleplay • Métier' });
    message.reply({ embeds: [embed] });
  },
};

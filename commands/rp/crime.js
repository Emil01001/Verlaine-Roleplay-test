const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

const crimes = [
  { name: 'Pickpocket', reward: [50,200], wanted: 1, jailTime: 60000, successRate: 0.75, desc: 'Vol à la tire dans la foule' },
  { name: 'Braquage de banque', reward: [1000,5000], wanted: 3, jailTime: 300000, successRate: 0.40, desc: 'Braquer une banque locale' },
  { name: 'Trafic de drogue', reward: [500,2000], wanted: 2, jailTime: 180000, successRate: 0.55, desc: 'Vente illégale de substances' },
  { name: 'Piratage informatique', reward: [300,1500], wanted: 2, jailTime: 120000, successRate: 0.60, desc: 'Hacker un système informatique' },
  { name: 'Vol de voiture', reward: [400,1800], wanted: 2, jailTime: 150000, successRate: 0.50, desc: 'Voler un véhicule' },
];

const cooldowns = new Map();

module.exports = {
  name: 'crime',
  aliases: ['braquer'],
  description: 'Commettre un crime pour gagner de l\'argent RP (risqué !)',
  usage: '-crime [liste|<numéro>]',

  async execute(message, args) {
    const userId = message.author.id;
    const now = Date.now();

    if (cooldowns.has(userId) && now < cooldowns.get(userId)) {
      const r = Math.ceil((cooldowns.get(userId)-now)/60000);
      return message.reply(`⏳ Tu es encore trop risqué ! Attends **${r} min**.`);
    }

    if (!args[0] || args[0] === 'liste') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🦹 Crimes disponibles')
        .setDescription(
          crimes.map((c,i) => `**${i+1}.** ${c.name}\n*${c.desc}*\n💰 ${c.reward[0]}-${c.reward[1]} € | ⭐ ${c.wanted} wanted | ✅ ${Math.floor(c.successRate*100)}% succès`).join('\n\n')
        )
        .setFooter({ text: 'Utilise -crime <numéro> pour commettre le crime | Verlaine Rôleplay' });
      return message.reply({ embeds: [embed] });
    }

    const idx = parseInt(args[0])-1;
    if (isNaN(idx)||idx<0||idx>=crimes.length) return message.reply('❌ Numéro de crime invalide.');

    const crime = crimes[idx];
    const p = getRpProfile(userId);
    const inJail = p.jail_until > now;
    if (inJail) return message.reply(`❌ Tu es en prison ! Libération <t:${Math.floor(p.jail_until/1000)}:R>.`);

    cooldowns.set(userId, now + 1800000);

    if (Math.random() < crime.successRate) {
      const gain = Math.floor(Math.random()*(crime.reward[1]-crime.reward[0]+1))+crime.reward[0];
      updateRpProfile(userId, {
        money: (p.money||0)+gain,
        wanted: Math.min(5, (p.wanted||0)+crime.wanted),
        xp: (p.xp||0)+10,
      });
      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle(`✅ ${crime.name} — Réussi !`)
        .setDescription(`Tu as réussi : **${crime.desc}**\n\n💰 +**${gain.toLocaleString()} €** RP\n⚠️ Niveau wanted : **${Math.min(5,(p.wanted||0)+crime.wanted)}** ⭐`)
        .setFooter({ text: 'Verlaine Rôleplay • Crime' });
      return message.reply({ embeds: [embed] });
    }

    const jailUntil = now + crime.jailTime;
    updateRpProfile(userId, { jail_until: jailUntil, wanted: 0 });
    const embed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle(`❌ ${crime.name} — Échoué !`)
      .setDescription(`Tu t'es fait attraper ! Tu es en prison jusqu'à <t:${Math.floor(jailUntil/1000)}:R>.\n\n*Niveau wanted réinitialisé.*`)
      .setFooter({ text: 'Verlaine Rôleplay • Crime' });
    message.reply({ embeds: [embed] });
  },
};

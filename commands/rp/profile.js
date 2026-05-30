const { EmbedBuilder } = require('discord.js');
const { getRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'profil',
  aliases: ['profile', 'rp'],
  description: 'Voir votre profil RP',
  usage: '-profil [@utilisateur]',

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const p = getRpProfile(target.id);

    const health = '🟩'.repeat(Math.floor(p.health/10)) + '⬛'.repeat(10-Math.floor(p.health/10));
    const hunger = '🟨'.repeat(Math.floor(p.hunger/10)) + '⬛'.repeat(10-Math.floor(p.hunger/10));
    const wanted = p.wanted > 0 ? `🔴 Recherché (${p.wanted} étoile${p.wanted>1?'s':''})` : '🟢 Propre';
    const inJail = p.jail_until > Date.now();
    const inHospital = p.hospital_until > Date.now();

    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setTitle(`👤 Profil RP — ${p.name || target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '📋 Identité', value: `**Nom :** ${p.name || 'Non défini'}\n**Âge :** ${p.age || '?'} ans\n**Métier :** ${p.job || 'Sans emploi'}`, inline: true },
        { name: '💰 Finances', value: `**Argent RP :** ${p.money?.toLocaleString() || 0} €\n**Niveau :** ${p.level}\n**XP :** ${p.xp}/100`, inline: true },
        { name: '🚗 Biens', value: `**Véhicule :** ${p.vehicle || 'Aucun'}\n**Maison :** ${p.house || 'Aucune'}`, inline: true },
        { name: `❤️ Santé (${p.health}/100)`, value: health, inline: true },
        { name: `🍔 Faim (${p.hunger}/100)`, value: hunger, inline: true },
        { name: '⚠️ Statut', value: `${wanted}\n${inJail ? `🔒 En prison jusqu'à <t:${Math.floor(p.jail_until/1000)}:R>` : ''}\n${inHospital ? `🏥 À l'hôpital jusqu'à <t:${Math.floor(p.hospital_until/1000)}:R>` : ''}` || '✅ Libre', inline: true },
        { name: '📝 Description', value: p.description || '*Aucune description.*', inline: false },
      )
      .setFooter({ text: `Verlaine Rôleplay • RP | Créé: ${p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Inconnu'}`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};

const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,
} = require('discord.js');
const config = require('../config');

const notifOptions = [
  { label: 'Notif. Annonces', emoji: '📣', value: config.roles.notifAnnonce, description: 'Notifications pour les annonces' },
  { label: 'Notif. Réseaux', emoji: '🌐', value: config.roles.notifReseaux, description: 'Notifications pour les réseaux sociaux' },
  { label: 'Notif. Sondage', emoji: '📊', value: config.roles.notifSondage, description: 'Notifications pour les sondages' },
  { label: 'Notif. Événementiel', emoji: '🎉', value: config.roles.notifEvenementiel, description: 'Notifications pour les événements' },
  { label: 'Notif. Spoils', emoji: '🔮', value: config.roles.notifSpoils, description: 'Notifications pour les spoils' },
  { label: 'Notif. Update', emoji: '🔔', value: config.roles.notifUpdate, description: 'Notifications pour les mises à jour' },
  { label: 'Notif. Journal', emoji: '📰', value: config.roles.notifJournal, description: 'Notifications pour le journal' },
];

async function handleOpenMenu(interaction) {
  const member = interaction.member;
  const currentRoles = notifOptions
    .filter(o => member.roles.cache.has(o.value))
    .map(o => o.value);

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('notification_select')
      .setPlaceholder('Sélectionnez vos notifications...')
      .setMinValues(0)
      .setMaxValues(notifOptions.length)
      .addOptions(notifOptions.map(opt => ({
        label: opt.label,
        emoji: opt.emoji,
        value: opt.value,
        description: opt.description,
        default: currentRoles.includes(opt.value),
      })))
  );

  return interaction.reply({
    content: '🔔 **Sélectionnez les notifications que vous souhaitez recevoir :**\n*Décochez pour retirer un rôle.*',
    components: [row],
    ephemeral: true,
  });
}

async function handleSelect(interaction) {
  const selected = interaction.values;
  const member = interaction.member;
  const guild = interaction.guild;

  const added = [];
  const removed = [];

  for (const opt of notifOptions) {
    const role = guild.roles.cache.get(opt.value);
    if (!role) continue;

    if (selected.includes(opt.value) && !member.roles.cache.has(opt.value)) {
      await member.roles.add(role).catch(() => {});
      added.push(opt.label);
    } else if (!selected.includes(opt.value) && member.roles.cache.has(opt.value)) {
      await member.roles.remove(role).catch(() => {});
      removed.push(opt.label);
    }
  }

  const lines = [];
  if (added.length) lines.push(`✅ **Ajouté :** ${added.join(', ')}`);
  if (removed.length) lines.push(`❌ **Retiré :** ${removed.join(', ')}`);
  if (!added.length && !removed.length) lines.push('ℹ️ Aucun changement effectué.');

  await interaction.update({
    content: `🔔 **Rôles de notification mis à jour !**\n\n${lines.join('\n')}`,
    components: [],
  });
}

module.exports = {
  handleOpenMenu,
  handleSelect,

  async sendSetupMessage(channel, guild) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('🔔 Être notifié !')
      .setDescription(
        `Afin de rester informé des dernières actualités du serveur, pense à **récupérer** les rôles de notifications ci-dessous en **cliquant** sur le bouton ci-dessous ainsi qu'en sélectionnant un rôle.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        notifOptions.map(o => `${o.emoji} **${o.label}**`).join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .setThumbnail('https://i.imgur.com/bell.png')
      .setFooter({ text: `Verlaine Rôleplay • Notifications`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_notif_menu')
        .setLabel('Sélectionnez vos notifications...')
        .setStyle(ButtonStyle.Secondary)
    );

    return channel.send({ embeds: [embed], components: [row] });
  },
};

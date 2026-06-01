const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, MessageFlags,
} = require('discord.js');
const config = require('../config');

const V2 = MessageFlags.IsComponentsV2;

const notifOptions = [
  { label: 'Notif. Annonces',     emoji: '📣', value: config.roles.notifAnnonce,      description: 'Notifications pour les annonces' },
  { label: 'Notif. Réseaux',      emoji: '🌐', value: config.roles.notifReseaux,       description: 'Notifications pour les réseaux sociaux' },
  { label: 'Notif. Sondage',      emoji: '📊', value: config.roles.notifSondage,       description: 'Notifications pour les sondages' },
  { label: 'Notif. Événementiel', emoji: '🎉', value: config.roles.notifEvenementiel,  description: 'Notifications pour les événements' },
  { label: 'Notif. Spoils',       emoji: '🔮', value: config.roles.notifSpoils,        description: 'Notifications pour les spoils' },
  { label: 'Notif. Update',       emoji: '🔔', value: config.roles.notifUpdate,        description: 'Notifications pour les mises à jour' },
  { label: 'Notif. Journal',      emoji: '📰', value: config.roles.notifJournal,       description: 'Notifications pour le journal' },
];

async function handleOpenMenu(interaction) {
  const member = interaction.member;
  const currentRoles = notifOptions
    .filter(o => member.roles.cache.has(o.value))
    .map(o => o.value);

  const container = new ContainerBuilder()
    .setAccentColor(config.colors.warning)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🔔 Gérer vos notifications\nSélectionnez les notifications que vous souhaitez recevoir.\n*Décochez pour retirer un rôle.*`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
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
      )
    );

  return interaction.reply({ components: [container], flags: V2, ephemeral: true });
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
      added.push(`${opt.emoji} ${opt.label}`);
    } else if (!selected.includes(opt.value) && member.roles.cache.has(opt.value)) {
      await member.roles.remove(role).catch(() => {});
      removed.push(`${opt.emoji} ${opt.label}`);
    }
  }

  const lines = [];
  if (added.length) lines.push(`✅ **Ajouté :** ${added.join(', ')}`);
  if (removed.length) lines.push(`❌ **Retiré :** ${removed.join(', ')}`);
  if (!added.length && !removed.length) lines.push('ℹ️ Aucun changement effectué.');

  const container = new ContainerBuilder()
    .setAccentColor(config.colors.success)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🔔 Rôles de notification mis à jour !\n${lines.join('\n')}`
      )
    );

  await interaction.update({ components: [container], flags: V2 });
}

module.exports = {
  handleOpenMenu,
  handleSelect,

  async sendSetupMessage(channel, guild) {
    const container = new ContainerBuilder()
      .setAccentColor(config.colors.warning)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🔔 Être notifié !\n` +
          `Afin de rester informé des dernières actualités du serveur, pense à **récupérer** les rôles de notifications ci-dessous en cliquant sur le bouton.\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          notifOptions.map(o => `${o.emoji} **${o.label}**`).join('\n') +
          `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('open_notif_menu')
            .setLabel('🔔 Sélectionnez vos notifications...')
            .setStyle(ButtonStyle.Secondary)
        )
      );
    return channel.send({ components: [container], flags: V2 });
  },
};

const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  PermissionFlagsBits, ChannelType,
} = require('discord.js');
const config = require('../config');
const { db } = require('../database/db');

async function handleOpenMenu(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_category_select')
      .setPlaceholder('Sélectionnez une catégorie...')
      .addOptions(config.ticketCategories.map(cat => ({
        label: cat.label,
        value: cat.value,
        description: cat.description,
      })))
  );
  return interaction.reply({ content: '📋 **Choisissez la catégorie de votre ticket :**', components: [row], ephemeral: true });
}

async function handleCategorySelect(interaction, client) {
  const category = interaction.values[0];
  const catInfo = config.ticketCategories.find(c => c.value === category);
  const guild = interaction.guild;

  const existing = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND status = ?').get(interaction.user.id, 'open');
  if (existing) {
    const ch = guild.channels.cache.get(existing.channel_id);
    if (ch) return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${ch}`, ephemeral: true });
  }

  const category_ch = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket')
  );

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: category_ch?.id || null,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  db.prepare('INSERT INTO tickets (channel_id, user_id, category, created_at) VALUES (?, ?, ?, ?)').run(
    channel.id, interaction.user.id, category, Date.now()
  );

  const embed = new EmbedBuilder()
    .setColor(catInfo.color)
    .setTitle(`🎫 Support — Verlaine Rôleplay`)
    .setDescription(
      `Bienvenue **${interaction.user.username}** !\n\n` +
      `Merci d'avoir ouvert un ticket dans la catégorie **${catInfo.label}**.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 **Décrivez votre problème** ou votre demande ci-dessous.\n` +
      `⏳ Un membre du staff vous répondra dans les plus brefs délais.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📂 **Catégorie :** ${catInfo.label}\n` +
      `👤 **Demandeur :** ${interaction.user}\n` +
      `🕐 **Ouvert le :** <t:${Math.floor(Date.now() / 1000)}:f>`
    )
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Verlaine Rôleplay • Support`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_close_${interaction.user.id}`)
      .setLabel('🔒 Fermer le ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
  await interaction.reply({ content: `✅ Ton ticket a été créé : ${channel}`, ephemeral: true });
}

async function handleClose(interaction, client) {
  const modal = new ModalBuilder()
    .setCustomId(`ticket_close_reason_${interaction.channel.id}`)
    .setTitle('Fermeture du ticket')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('close_reason')
          .setLabel('Raison de fermeture (optionnel)')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setPlaceholder('Ex: Problème résolu, demande traitée...')
      )
    );
  await interaction.showModal(modal);
}

async function handleCloseReason(interaction, client) {
  const reason = interaction.fields.getTextInputValue('close_reason') || 'Aucune raison fournie';
  const channelId = interaction.customId.replace('ticket_close_reason_', '');

  const ticket = db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
  if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

  db.prepare('UPDATE tickets SET status = ?, closed_at = ? WHERE channel_id = ?').run('closed', Date.now(), channelId);

  const embed = new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('🔒 Ticket fermé')
    .setDescription(
      `**Fermé par :** ${interaction.user}\n` +
      `**Raison :** ${reason}\n` +
      `**Fermé le :** <t:${Math.floor(Date.now() / 1000)}:f>\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Ce salon sera supprimé dans **10 secondes**.`
    )
    .setFooter({ text: `Verlaine Rôleplay • Support`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const userId = ticket.user_id;
  const user = await client.users.fetch(userId).catch(() => null);

  if (user) {
    await sendRatingDM(user, channelId, user.username);
  }

  setTimeout(async () => {
    const ch = interaction.guild.channels.cache.get(channelId);
    if (ch) await ch.delete().catch(() => {});
  }, 10000);
}

async function sendRatingDM(user, channelId, username) {
  const ratingEmbed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('⭐ Évaluez votre expérience')
    .setDescription(`@${username}, veuillez évaluer votre expérience de support :`)
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_rate_open_${channelId}`)
      .setLabel('⭐ Évaluez votre expérience')
      .setStyle(ButtonStyle.Secondary)
  );

  await user.send({ embeds: [ratingEmbed], components: [row] }).catch(() => {});
}

async function handleRatingOpen(interaction) {
  const channelId = interaction.customId.replace('ticket_rate_open_', '');

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`ticket_rate_select_${channelId}`)
      .setPlaceholder('Choisissez une note...')
      .addOptions([
        { label: '1 Étoile - Très mauvais', value: '1', emoji: '⭐' },
        { label: '2 Étoiles - Mauvais', value: '2', emoji: '⭐' },
        { label: '3 Étoiles - Moyen', value: '3', emoji: '⭐' },
        { label: '4 Étoiles - Bien', value: '4', emoji: '⭐' },
        { label: '5 Étoiles - Excellent', value: '5', emoji: '⭐' },
      ])
  );

  const embed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('⭐ Évaluez votre expérience')
    .setDescription('Sélectionnez une note dans le menu ci-dessous :')
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });

  await interaction.update({ embeds: [embed], components: [selectRow] });
}

async function handleRatingSelect(interaction) {
  const parts = interaction.customId.split('_');
  const channelId = parts.slice(4).join('_');
  const rating = parseInt(interaction.values[0]);

  db.prepare('UPDATE tickets SET rating = ? WHERE channel_id = ?').run(rating, channelId);

  const labels = ['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent'];
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('✅ Merci pour votre évaluation !')
    .setDescription(
      `Vous avez attribué la note : **${stars}**\n` +
      `**${rating}/5 — ${labels[rating]}**\n\n` +
      `Votre retour nous aide à améliorer notre support !`
    )
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });

  await interaction.update({ embeds: [embed], components: [] });
}

// Legacy button handler (kept for backward compat)
async function handleRating(interaction) {
  if (interaction.customId.startsWith('ticket_rate_open_')) {
    return handleRatingOpen(interaction);
  }
  const parts = interaction.customId.split('_');
  const rating = parseInt(parts[parts.length - 1]);
  const channelId = parts.slice(2, -1).join('_');
  db.prepare('UPDATE tickets SET rating = ? WHERE channel_id = ?').run(rating, channelId);
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('✅ Merci pour votre évaluation !')
    .setDescription(`Vous avez attribué la note : **${stars} (${rating}/5)**`)
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });
  await interaction.update({ embeds: [embed], components: [] });
}

module.exports = {
  handleOpenMenu,
  handleCategorySelect,
  handleClose,
  handleCloseReason,
  handleRating,
  handleRatingOpen,
  handleRatingSelect,
  sendRatingDM,

  async sendSetupMessage(channel, guild) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('🎫 Support — Verlaine Rôleplay')
      .setDescription(
        `Bienvenue dans le système de support de **Verlaine Rôleplay** !\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pour ouvrir un ticket, cliquez sur le bouton ci-dessous et sélectionnez la catégorie correspondant à votre demande.\n\n` +
        `**Catégories disponibles :**\n` +
        config.ticketCategories.map(c => `• ${c.emoji} **${c.label}**`).join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • Support`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket_menu')
        .setLabel('📋 Ouvrir un ticket')
        .setStyle(ButtonStyle.Primary)
    );

    return channel.send({ embeds: [embed], components: [row] });
  },
};

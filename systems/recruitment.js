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
      .setCustomId('recruitment_category_select')
      .setPlaceholder('Sélectionnez une catégorie...')
      .addOptions(config.recruitmentCategories.map(cat => ({
        label: cat.label,
        emoji: cat.emoji,
        value: cat.value,
        description: cat.description,
      })))
  );
  return interaction.reply({ content: '📋 **Choisissez la catégorie pour laquelle vous souhaitez candidater :**', components: [row], ephemeral: true });
}

async function handleCategorySelect(interaction, client) {
  const category = interaction.values[0];
  const catInfo = config.recruitmentCategories.find(c => c.value === category);

  const existing = db.prepare('SELECT * FROM recruitment_tickets WHERE user_id = ? AND status = ?').get(interaction.user.id, 'open');
  if (existing) {
    const ch = interaction.guild.channels.cache.get(existing.channel_id);
    if (ch) return interaction.reply({ content: `❌ Tu as déjà une candidature ouverte : ${ch}`, ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId(`recruitment_modal_${category}`)
    .setTitle(`Candidature — ${catInfo.label}`);

  const fields = catInfo.questions.slice(0, 5).map((q, i) =>
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(`q${i}`)
        .setLabel(q.length > 45 ? q.substring(0, 45) : q)
        .setStyle(i >= 2 ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(500)
    )
  );

  modal.addComponents(...fields);
  await interaction.showModal(modal);
}

async function handleModalSubmit(interaction, client) {
  const category = interaction.customId.replace('recruitment_modal_', '');
  const catInfo = config.recruitmentCategories.find(c => c.value === category);

  const answers = {};
  for (let i = 0; i < catInfo.questions.length && i < 5; i++) {
    answers[catInfo.questions[i]] = interaction.fields.getTextInputValue(`q${i}`);
  }

  const guild = interaction.guild;
  const recruitCategory = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('recruit')
  );

  const channel = await guild.channels.create({
    name: `candidature-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${category}`,
    type: ChannelType.GuildText,
    parent: recruitCategory?.id || null,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  db.prepare('INSERT INTO recruitment_tickets (channel_id, user_id, category, answers, created_at) VALUES (?, ?, ?, ?, ?)').run(
    channel.id, interaction.user.id, category, JSON.stringify(answers), Date.now()
  );

  const embed1 = new EmbedBuilder()
    .setColor(config.colors.info)
    .setTitle(`📋 Candidature — ${catInfo.label}`)
    .setDescription(
      `Candidature reçue de **${interaction.user.username}**.\n\n` +
      `Nos recruteurs vont examiner votre dossier dans les plus brefs délais.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `**Verlaine Rôleplay • Recrutement** | <t:${Math.floor(Date.now() / 1000)}:f>`
    )
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Verlaine Rôleplay • Recrutement`, iconURL: guild.iconURL({ dynamic: true }) });

  const embed2 = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle(`📝 Informations du candidat`)
    .setDescription(`**Candidature de ${interaction.user.username}**`)
    .addFields(
      Object.entries(answers).map(([k, v]) => ({ name: k, value: v || 'Non renseigné', inline: false }))
    )
    .setFooter({ text: `Candidature de ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`recruit_accept_${interaction.user.id}`)
      .setLabel('✅ Accepter')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`recruit_deny_${interaction.user.id}`)
      .setLabel('❌ Refuser')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`recruit_close_${interaction.user.id}`)
      .setLabel('🔒 Fermer la candidature')
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ content: `${interaction.user}`, embeds: [embed1, embed2], components: [row] });

  await interaction.reply({
    content: `✅ Ta candidature pour **${catInfo.label}** a été envoyée ! Retrouve-la ici : ${channel}`,
    ephemeral: true
  });
}

async function handleAccept(interaction, client) {
  const userId = interaction.customId.replace('recruit_accept_', '');
  const ticket = db.prepare('SELECT * FROM recruitment_tickets WHERE channel_id = ?').get(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

  db.prepare('UPDATE recruitment_tickets SET status = ? WHERE channel_id = ?').run('accepted', interaction.channel.id);

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('✅ Candidature acceptée !')
    .setDescription(`La candidature de <@${userId}> a été **acceptée** par ${interaction.user} !\n\n*Ce salon sera supprimé dans 15 secondes.*`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const user = await client.users.fetch(userId).catch(() => null);
  if (user) {
    const dmEmbed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('🎉 Candidature acceptée — Verlaine Rôleplay')
      .setDescription(
        `Félicitations ! Ta candidature pour **${ticket.category}** sur **Verlaine Rôleplay** a été **acceptée** ! 🎊\n\n` +
        `Un membre de l'équipe prendra contact avec toi prochainement.\n\n` +
        `Bienvenue dans l'équipe !`
      )
      .setFooter({ text: `Verlaine Rôleplay • Recrutement` });
    await user.send({ embeds: [dmEmbed] }).catch(() => {});
  }

  setTimeout(async () => {
    await interaction.channel.delete().catch(() => {});
  }, 15000);
}

async function handleDeny(interaction, client) {
  const userId = interaction.customId.replace('recruit_deny_', '');
  const ticket = db.prepare('SELECT * FROM recruitment_tickets WHERE channel_id = ?').get(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

  db.prepare('UPDATE recruitment_tickets SET status = ? WHERE channel_id = ?').run('denied', interaction.channel.id);

  const embed = new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('❌ Candidature refusée')
    .setDescription(`La candidature de <@${userId}> a été **refusée** par ${interaction.user}.\n\n*Ce salon sera supprimé dans 15 secondes.*`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const user = await client.users.fetch(userId).catch(() => null);
  if (user) {
    const dmEmbed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setTitle('❌ Candidature refusée — Verlaine Rôleplay')
      .setDescription(
        `Ta candidature pour **${ticket.category}** sur **Verlaine Rôleplay** n'a malheureusement pas été retenue.\n\n` +
        `Ne te décourage pas ! Tu pourras re-candidater dans le futur.\n\n` +
        `Merci de l'intérêt que tu portes au serveur.`
      )
      .setFooter({ text: `Verlaine Rôleplay • Recrutement` });
    await user.send({ embeds: [dmEmbed] }).catch(() => {});
  }

  setTimeout(async () => {
    await interaction.channel.delete().catch(() => {});
  }, 15000);
}

async function handleClose(interaction, client) {
  const userId = interaction.customId.replace('recruit_close_', '');
  const ticket = db.prepare('SELECT * FROM recruitment_tickets WHERE channel_id = ?').get(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

  db.prepare('UPDATE recruitment_tickets SET status = ? WHERE channel_id = ?').run('closed', interaction.channel.id);

  const embed = new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle('🔒 Candidature fermée')
    .setDescription(`La candidature de <@${userId}> a été **fermée** par ${interaction.user}.\n\n*Ce salon sera supprimé dans 10 secondes.*`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const user = await client.users.fetch(userId).catch(() => null);
  if (user) {
    await sendRatingDM(user, interaction.channel.id, user.username);
  }

  setTimeout(async () => {
    await interaction.channel.delete().catch(() => {});
  }, 10000);
}

// ── RATING SYSTEM (Select Menu style matching screenshot) ──────────────

async function sendRatingDM(user, channelId, username) {
  const ratingEmbed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('⭐ Évaluez votre expérience')
    .setDescription(`@${username}, veuillez évaluer votre expérience de support :`)
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`recruit_rate_open_${channelId}`)
      .setLabel('⭐ Évaluez votre expérience')
      .setStyle(ButtonStyle.Secondary)
  );

  await user.send({ embeds: [ratingEmbed], components: [row] }).catch(() => {});
}

async function handleRatingOpen(interaction) {
  const channelId = interaction.customId.replace('recruit_rate_open_', '');

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`recruit_rate_select_${channelId}`)
      .setPlaceholder('Choisissez une note...')
      .addOptions([
        { label: '1 Étoile - Très mauvais',  value: '1', emoji: '⭐' },
        { label: '2 Étoiles - Mauvais',       value: '2', emoji: '⭐' },
        { label: '3 Étoiles - Moyen',         value: '3', emoji: '⭐' },
        { label: '4 Étoiles - Bien',          value: '4', emoji: '⭐' },
        { label: '5 Étoiles - Excellent',     value: '5', emoji: '⭐' },
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
  const channelId = interaction.customId.replace('recruit_rate_select_', '');
  const rating = parseInt(interaction.values[0]);
  const labels = ['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent'];
  const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  db.prepare('UPDATE recruitment_tickets SET status = ? WHERE channel_id = ?').run('rated', channelId);

  const embed = new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('✅ Merci pour votre évaluation !')
    .setDescription(
      `Vous avez attribué la note : **${stars}**\n` +
      `**${rating}/5 — ${labels[rating]}**\n\n` +
      `Votre retour nous aide à améliorer notre équipe !`
    )
    .setFooter({ text: `Verlaine Rôleplay • Évaluation` });

  await interaction.update({ embeds: [embed], components: [] });
}

module.exports = {
  handleOpenMenu,
  handleCategorySelect,
  handleModalSubmit,
  handleAccept,
  handleDeny,
  handleClose,
  sendRatingDM,
  handleRatingOpen,
  handleRatingSelect,

  async sendSetupMessage(channel, guild) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📋 Recrutement')
      .setDescription(
        `Bienvenue dans le système de recrutement staff de **Verlaine Rôleplay** !\n\n` +
        `Choisis la catégorie qui t'intéresse, puis remplis le formulaire.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `**Catégories disponibles :**\n` +
        config.recruitmentCategories.map(c => `• ${c.emoji} **${c.label}** *(ouvert)*`).join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • Recrutement`, iconURL: guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_recruitment_menu')
        .setLabel('📝 Postuler')
        .setStyle(ButtonStyle.Primary)
    );

    return channel.send({ embeds: [embed], components: [row] });
  },
};

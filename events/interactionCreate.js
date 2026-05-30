const ticketSystem = require('../systems/ticket');
const recruitmentSystem = require('../systems/recruitment');
const notificationSystem = require('../systems/notification');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {

      // ── BUTTONS ──────────────────────────────────────────────────
      if (interaction.isButton()) {
        const id = interaction.customId;

        // Ticket
        if (id === 'open_ticket_menu' || id === 'open_support_ticket') {
          return ticketSystem.handleOpenMenu(interaction);
        }
        if (id.startsWith('ticket_close_') && !id.startsWith('ticket_close_reason_')) {
          return ticketSystem.handleClose(interaction, client);
        }
        if (id.startsWith('ticket_confirm_close_')) {
          return ticketSystem.handleConfirmClose?.(interaction, client);
        }
        if (id.startsWith('ticket_cancel_close_')) {
          return ticketSystem.handleCancelClose?.(interaction);
        }
        // Rating button → open select menu
        if (id.startsWith('ticket_rate_open_')) {
          return ticketSystem.handleRatingOpen(interaction);
        }
        // Legacy star buttons (1-5)
        if (id.startsWith('ticket_rate_') && !id.startsWith('ticket_rate_open_') && !id.startsWith('ticket_rate_select_')) {
          return ticketSystem.handleRating(interaction);
        }

        // Recruitment
        if (id === 'open_recruitment_menu') {
          return recruitmentSystem.handleOpenMenu(interaction);
        }
        if (id.startsWith('recruit_close_')) {
          return recruitmentSystem.handleClose(interaction, client);
        }
        if (id.startsWith('recruit_accept_')) {
          return recruitmentSystem.handleAccept(interaction, client);
        }
        if (id.startsWith('recruit_deny_')) {
          return recruitmentSystem.handleDeny(interaction, client);
        }
        // Recruitment rating button → open select menu
        if (id.startsWith('recruit_rate_open_')) {
          return recruitmentSystem.handleRatingOpen?.(interaction);
        }

        // Notifications
        if (id === 'open_notif_menu') {
          return notificationSystem.handleOpenMenu(interaction);
        }
      }

      // ── SELECT MENUS ─────────────────────────────────────────────
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;

        if (id === 'ticket_category_select') {
          return ticketSystem.handleCategorySelect(interaction, client);
        }
        if (id === 'recruitment_category_select') {
          return recruitmentSystem.handleCategorySelect(interaction, client);
        }
        if (id === 'notification_select') {
          return notificationSystem.handleSelect(interaction);
        }
        // Ticket rating select menu
        if (id.startsWith('ticket_rate_select_')) {
          return ticketSystem.handleRatingSelect(interaction);
        }
        // Recruitment rating select menu
        if (id.startsWith('recruit_rate_select_')) {
          return recruitmentSystem.handleRatingSelect?.(interaction);
        }
      }

      // ── MODALS ────────────────────────────────────────────────────
      if (interaction.isModalSubmit()) {
        const id = interaction.customId;

        if (id.startsWith('recruitment_modal_')) {
          return recruitmentSystem.handleModalSubmit(interaction, client);
        }
        if (id.startsWith('ticket_close_reason_')) {
          return ticketSystem.handleCloseReason(interaction, client);
        }
      }

    } catch (err) {
      console.error('Erreur interaction:', err);
      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true }).catch(() => {});
      }
    }
  },
};

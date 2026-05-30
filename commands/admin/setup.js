const { EmbedBuilder } = require('discord.js');
const ticketSystem = require('../../systems/ticket');
const recruitmentSystem = require('../../systems/recruitment');
const notificationSystem = require('../../systems/notification');
const config = require('../../config');

module.exports = {
  name: 'setup',
  description: 'Configurer un système dans le salon actuel',
  usage: '-setup <ticket|recrutement|notification|boost|bienvenue>',
  adminOnly: true,

  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Tu dois être **administrateur** pour utiliser cette commande.');
    }

    const system = args[0]?.toLowerCase();
    if (!system) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle('⚙️ Configuration — Verlaine Rôleplay')
        .setDescription(
          `**Systèmes disponibles :**\n\n` +
          `\`-setup ticket\` — Système de tickets support\n` +
          `\`-setup recrutement\` — Système de recrutement\n` +
          `\`-setup notification\` — Système de rôles notifications\n`
        )
        .setFooter({ text: `Verlaine Rôleplay • Admin` });
      return message.reply({ embeds: [embed] });
    }

    await message.delete().catch(() => {});

    switch (system) {
      case 'ticket':
        await ticketSystem.sendSetupMessage(message.channel, message.guild);
        break;
      case 'recrutement':
      case 'recruitment':
        await recruitmentSystem.sendSetupMessage(message.channel, message.guild);
        break;
      case 'notification':
      case 'notif':
        await notificationSystem.sendSetupMessage(message.channel, message.guild);
        break;
      default:
        return message.reply('❌ Système inconnu. Utilise `-setup` pour voir les systèmes disponibles.');
    }
  },
};

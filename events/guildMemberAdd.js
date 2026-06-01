const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} = require('discord.js');
const config = require('../config');

const V2 = MessageFlags.IsComponentsV2;

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const channel = member.guild.channels.cache.find(c => c.name && c.name.toLowerCase().includes('bienvenu'));
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.info)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## <a:welcome:1504950764370399284> Bienvenue sur **Verlaine Rôleplay** !\n` +
          `Bienvenue à toi **${member.user.username}** sur le serveur de **Verlaine Rôleplay** !\n\n` +
          `Tu es le **${memberCount}ème membre** à nous rejoindre.\n\n` +
          `─────────────────────────────\n` +
          `📖 N'hésitez pas à consulter le <#${config.channels.reglement}> avant toute chose.\n` +
          `📋 Pour toute **question**, la catégorie **support** est à votre disposition.\n` +
          `📣 N'hésitez pas à consulter également <#${config.channels.announce}> pour rester **informé** des dernières actualités.\n` +
          `ℹ️ Retrouvez toutes les informations importantes dans <#${config.channels.informations}>.\n` +
          `─────────────────────────────`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('📖 Règlement')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${member.guild.id}/${config.channels.reglement}`),
          new ButtonBuilder()
            .setLabel('📋 Support')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('open_support_ticket'),
          new ButtonBuilder()
            .setLabel('📣 Annonces')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${member.guild.id}/${config.channels.announce}`),
          new ButtonBuilder()
            .setLabel('🔔 Notifications')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('open_notif_menu')
        )
      );

    await channel.send({ components: [container], flags: V2 });
  },
};

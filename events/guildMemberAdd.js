const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const channel = member.guild.channels.cache.find(c => c.name && c.name.toLowerCase().includes('bienvenu'));
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`<a:welcome:1504950764370399284> Bienvenue sur **Verlaine Rôleplay** !`)
      .setDescription(
        `Bienvenue à toi **${member.user.username}** sur le serveur de **Verlaine Rôleplay** !\n\n` +
        `Tu es le **${memberCount}ème membre** à nous rejoindre.\n\n` +
        `─────────────────────────────\n` +
        `📖 N'hésitez pas à consulter le <#${config.channels.reglement}> avant toute chose.\n` +
        `📋 Pour toute **question**, la catégorie **support** est à votre disposition.\n` +
        `📣 N'hésitez pas à consulter également <#${config.channels.announce}> pour rester **informé** des dernières actualités.\n` +
        `ℹ️ Retrouvez toutes les informations importantes dans <#${config.channels.informations}>.\n` +
        `─────────────────────────────`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage('https://i.imgur.com/placeholder.png')
      .setFooter({ text: `Verlaine Rôleplay • Bienvenue !`, iconURL: member.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('📖 Règlement')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${member.guild.id}/${config.channels.reglement}`),
      new ButtonBuilder()
        .setLabel('📋 Support')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('open_support_ticket'),
      new ButtonBuilder()
        .setLabel('📣 Annonces')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${member.guild.id}/${config.channels.announce}`),
      new ButtonBuilder()
        .setLabel('🔔 Notifications')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('open_notif_menu')
    );

    await channel.send({ embeds: [embed], components: [row] });
  },
};

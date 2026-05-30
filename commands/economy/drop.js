const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'drop',
  description: 'Lance un drop de coins (Admin seulement)',
  usage: '-drop <montant>',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const amount = parseInt(args[0]);
    if (!amount || amount < 1) return message.reply('❌ Spécifie un montant valide.');

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('💸 DROP DE COINS !')
      .setDescription(
        `Un drop de **${amount.toLocaleString()} coins** est disponible !\n\n` +
        `Sois le **premier** à cliquer sur le bouton ci-dessous pour récupérer les coins ! 💨`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Drop' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('claim_drop').setLabel('💰 CLAIM !').setStyle(ButtonStyle.Success)
    );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });
    let claimed = false;

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (claimed) return i.reply({ content: '❌ Ce drop a déjà été récupéré !', ephemeral: true });
      claimed = true;
      collector.stop('claimed');

      addBalance(i.user.id, amount);

      const claimedEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('✅ Drop récupéré !')
        .setDescription(`**${i.user.username}** a été le plus rapide et récupère **+${amount.toLocaleString()} coins** ! 🏆`)
        .setFooter({ text: 'Verlaine Rôleplay • Drop' });

      await i.update({ embeds: [claimedEmbed], components: [] });
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'claimed') {
        const expiredEmbed = new EmbedBuilder()
          .setColor(config.colors.error)
          .setTitle('⏱️ Drop expiré !')
          .setDescription(`Personne n'a récupéré le drop de **${amount.toLocaleString()} coins**...`)
          .setFooter({ text: 'Verlaine Rôleplay • Drop' });
        msg.edit({ embeds: [expiredEmbed], components: [] }).catch(() => {});
      }
    });
  },
};

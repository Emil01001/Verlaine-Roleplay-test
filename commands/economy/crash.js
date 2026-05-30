const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'crash',
  description: 'Jeu du Crash — Cash out avant le crash !',
  usage: '-crash <mise>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**. Usage : `-crash <mise>`');

    const eco = getEconomy(message.author.id);
    if (eco.balance < bet) return message.reply(`❌ Solde insuffisant !`);

    removeBalance(message.author.id, bet);

    const crashAt = parseFloat((1 + Math.random() * 9).toFixed(2));
    let multiplier = 1.0;
    let cashedOut = false;

    const makeEmbed = () => new EmbedBuilder()
      .setColor(multiplier >= 2 ? config.colors.success : config.colors.warning)
      .setTitle('🚀 Crash — Verlaine Rôleplay')
      .setDescription(
        `**Multiplicateur actuel : x${multiplier.toFixed(2)}**\n\n` +
        `💰 Gain potentiel : **${Math.floor(bet * multiplier).toLocaleString()} coins**\n\n` +
        `⚡ *Cash out avant le crash !*`
      )
      .setFooter({ text: `Mise: ${bet.toLocaleString()} coins` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('crash_cashout').setLabel('💸 Cash Out !').setStyle(ButtonStyle.Success)
    );

    const msg = await message.reply({ embeds: [makeEmbed()], components: [row] });

    const interval = setInterval(async () => {
      multiplier = parseFloat((multiplier + 0.1 + Math.random() * 0.2).toFixed(2));
      if (!cashedOut) {
        await msg.edit({ embeds: [makeEmbed()], components: [row] }).catch(() => {});
      }
      if (multiplier >= crashAt) {
        clearInterval(interval);
        collector.stop('crash');
      }
    }, 1500);

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 30000 });

    collector.on('collect', async i => {
      if (i.customId === 'crash_cashout' && !cashedOut) {
        cashedOut = true;
        clearInterval(interval);
        const win = Math.floor(bet * multiplier);
        addBalance(message.author.id, win);
        const embed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setTitle('💸 Cash Out réussi !')
          .setDescription(`Tu as cash out à **x${multiplier.toFixed(2)}** et gagné **+${win.toLocaleString()} coins** !\n\n*(Le crash était à x${crashAt})*`)
          .setFooter({ text: `Verlaine Rôleplay • Crash` });
        await i.update({ embeds: [embed], components: [] });
        collector.stop('cashout');
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'crash') {
        clearInterval(interval);
        if (!cashedOut) {
          const embed = new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle('💥 CRASH !')
            .setDescription(`Le crash s'est produit à **x${crashAt}** !\n\nTu perds **${bet.toLocaleString()} coins** 😢`)
            .setFooter({ text: `Verlaine Rôleplay • Crash` });
          msg.edit({ embeds: [embed], components: [] }).catch(() => {});
        }
      }
    });
  },
};

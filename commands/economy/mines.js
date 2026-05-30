const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const GRID = 5;

module.exports = {
  name: 'mines',
  description: 'Trouve les cases sûres et encaisse avant d\'exploser',
  usage: '-mines <mise> <1-15 bombes>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    const bombs = parseInt(args[1]);
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**.');
    if (!bombs || bombs < 1 || bombs > 15) return message.reply('❌ Nombre de bombes : **1 à 15**.');

    const eco = getEconomy(message.author.id);
    if (eco.balance < bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    const total = GRID * GRID;
    const safe = total - bombs;
    const positions = Array.from({ length: total }, (_, i) => i);
    const bombSet = new Set();
    while (bombSet.size < bombs) bombSet.add(Math.floor(Math.random() * total));

    const revealed = new Array(total).fill(false);
    let multiplier = 1.0;
    let lost = false;
    let safeFound = 0;

    const makeGrid = () => {
      const rows = [];
      for (let r = 0; r < GRID; r++) {
        const rowComps = [];
        for (let c = 0; c < GRID; c++) {
          const idx = r * GRID + c;
          if (revealed[idx]) {
            rowComps.push(new ButtonBuilder().setCustomId(`m_${idx}`).setLabel(bombSet.has(idx) ? '💣' : '💎').setStyle(bombSet.has(idx) ? ButtonStyle.Danger : ButtonStyle.Success).setDisabled(true));
          } else {
            rowComps.push(new ButtonBuilder().setCustomId(`m_${idx}`).setLabel('▫️').setStyle(ButtonStyle.Secondary).setDisabled(lost));
          }
        }
        rows.push(new ActionRowBuilder().addComponents(rowComps));
      }
      return rows;
    };

    const cashoutRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('mines_cashout').setLabel(`💸 Cash Out (x${multiplier.toFixed(2)})`).setStyle(ButtonStyle.Primary)
    );

    const makeEmbed = () => new EmbedBuilder()
      .setColor(lost ? config.colors.error : config.colors.economy)
      .setTitle(`💣 Mines — ${bombs} bombes`)
      .setDescription(
        `**Multiplicateur :** x${multiplier.toFixed(2)}\n` +
        `**Gain potentiel :** ${Math.floor(bet * multiplier).toLocaleString()} coins\n` +
        `**Cases sûres trouvées :** ${safeFound}/${safe}`
      )
      .setFooter({ text: `Mise: ${bet.toLocaleString()} coins | Verlaine Rôleplay` });

    const msg = await message.reply({ embeds: [makeEmbed()], components: [...makeGrid(), cashoutRow()] });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 120000 });

    collector.on('collect', async i => {
      if (i.customId === 'mines_cashout') {
        const win = Math.floor(bet * multiplier);
        addBalance(message.author.id, win);
        collector.stop('cashout');
        const embed = makeEmbed().setColor(config.colors.success).setDescription(`💸 **Cash out à x${multiplier.toFixed(2)}** !\nTu gagnes **+${win.toLocaleString()} coins** !`);
        return i.update({ embeds: [embed], components: makeGrid() });
      }

      const idx = parseInt(i.customId.split('_')[1]);
      revealed[idx] = true;

      if (bombSet.has(idx)) {
        lost = true;
        for (let j = 0; j < total; j++) revealed[j] = true;
        collector.stop('boom');
        const embed = makeEmbed().setDescription(`💥 **BOOM !** Tu as trouvé une bombe et perdu **${bet.toLocaleString()} coins** !`);
        return i.update({ embeds: [embed], components: makeGrid() });
      }

      safeFound++;
      multiplier = parseFloat((1 + (safeFound / safe) * (bombs / 5 + 0.5)).toFixed(2));
      await i.update({ embeds: [makeEmbed()], components: [...makeGrid(), cashoutRow()] });
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        msg.edit({ embeds: [makeEmbed().setDescription('⏱️ Temps écoulé — la partie a expiré.')], components: makeGrid() }).catch(() => {});
      }
    });
  },
};

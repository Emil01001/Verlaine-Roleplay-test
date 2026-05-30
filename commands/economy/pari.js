const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'pari',
  description: 'Crée un pari personnalisé',
  usage: '-pari <question> | <option1> | <option2> | <mise_min>',

  async execute(message, args) {
    const input = args.join(' ').split('|').map(s => s.trim());
    if (input.length < 3) {
      return message.reply('❌ Usage: `-pari <question> | <option1> | <option2> | <mise_min>`\nExemple: `-pari Qui gagne ? | Option A | Option B | 100`');
    }

    const [question, opt1, opt2, minBetStr] = input;
    const minBet = parseInt(minBetStr) || 10;

    const bets = { [opt1]: [], [opt2]: [] };
    const userBets = {};

    const embed = () => {
      const total1 = bets[opt1].reduce((s, b) => s+b.amount, 0);
      const total2 = bets[opt2].reduce((s, b) => s+b.amount, 0);
      return new EmbedBuilder()
        .setColor(config.colors.economy)
        .setTitle(`🎲 Pari — ${question}`)
        .addFields(
          { name: `🔵 ${opt1}`, value: `${bets[opt1].length} pari(s) — ${total1.toLocaleString()} coins`, inline: true },
          { name: `🔴 ${opt2}`, value: `${bets[opt2].length} pari(s) — ${total2.toLocaleString()} coins`, inline: true },
        )
        .setDescription(`Mise minimum : **${minBet.toLocaleString()} coins**\n\nCliquez sur un bouton pour parier !`)
        .setFooter({ text: 'Verlaine Rôleplay • Pari | Lanceur: '+message.author.username });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pari_opt1').setLabel(`🔵 ${opt1}`).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('pari_opt2').setLabel(`🔴 ${opt2}`).setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('pari_close').setLabel('🔒 Fermer et choisir gagnant').setStyle(ButtonStyle.Secondary),
    );

    const msg = await message.reply({ embeds: [embed()], components: [row] });
    const collector = msg.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async i => {
      if (i.customId === 'pari_close') {
        if (i.user.id !== message.author.id) return i.reply({ content: '❌ Seul le créateur du pari peut le fermer.', ephemeral: true });
        collector.stop('closed');

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('winner_opt1').setLabel(`✅ ${opt1} gagne`).setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('winner_opt2').setLabel(`✅ ${opt2} gagne`).setStyle(ButtonStyle.Success),
        );
        return i.update({ embeds: [embed().setTitle(`🔒 Pari fermé — ${question}`)], components: [closeRow] });
      }

      if (i.customId.startsWith('winner_')) {
        if (i.user.id !== message.author.id) return i.reply({ content: '❌ Permission refusée.', ephemeral: true });
        const winOpt = i.customId === 'winner_opt1' ? opt1 : opt2;
        const loseOpt = winOpt === opt1 ? opt2 : opt1;
        const totalPool = [...bets[opt1], ...bets[opt2]].reduce((s, b) => s+b.amount, 0);
        const winPool = bets[winOpt].reduce((s, b) => s+b.amount, 0);

        for (const b of bets[winOpt]) {
          if (winPool > 0) {
            const share = Math.floor((b.amount / winPool) * totalPool);
            addBalance(b.userId, share);
          }
        }

        const resultEmbed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setTitle(`🏆 Résultat du pari — **${winOpt}** gagne !`)
          .setDescription(`Pool total : **${totalPool.toLocaleString()} coins** redistribués aux gagnants !`)
          .setFooter({ text: 'Verlaine Rôleplay • Pari' });
        return i.update({ embeds: [resultEmbed], components: [] });
      }

      if (userBets[i.user.id]) return i.reply({ content: '❌ Tu as déjà parié !', ephemeral: true });

      const eco = getEconomy(i.user.id);
      if (eco.balance < minBet) return i.reply({ content: `❌ Mise minimum : **${minBet}** coins.`, ephemeral: true });

      const betAmount = minBet;
      removeBalance(i.user.id, betAmount);
      const chosenOpt = i.customId === 'pari_opt1' ? opt1 : opt2;
      bets[chosenOpt].push({ userId: i.user.id, amount: betAmount });
      userBets[i.user.id] = chosenOpt;

      await i.reply({ content: `✅ Tu as parié **${betAmount} coins** sur **${chosenOpt}** !`, ephemeral: true });
      await msg.edit({ embeds: [embed()], components: [row] });
    });
  },
};

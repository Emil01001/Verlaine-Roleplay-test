const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

function drawCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return { suit: suits[Math.floor(Math.random() * 4)], value: values[Math.floor(Math.random() * 13)] };
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function handValue(hand) {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function formatHand(hand, hide = false) {
  if (hide) return `${hand[0].value}${hand[0].suit} | 🂠`;
  return hand.map(c => `${c.value}${c.suit}`).join(' ');
}

module.exports = {
  name: 'bj',
  aliases: ['blackjack', 'n'],
  description: 'Jouer au blackjack',
  usage: '-bj <mise>',
  cooldown: 3,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**. Usage : `-bj <mise>`');

    const eco = getEconomy(message.author.id);
    if (eco.balance < bet) return message.reply(`❌ Solde insuffisant ! Tu as **${eco.balance.toLocaleString()}** coins.`);

    removeBalance(message.author.id, bet);

    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];

    const makeEmbed = (status = 'playing') => {
      const pv = handValue(playerHand);
      const dv = status === 'playing' ? cardValue(dealerHand[0]) : handValue(dealerHand);
      const color = status === 'win' ? config.colors.success : status === 'lose' ? config.colors.error : config.colors.economy;

      return new EmbedBuilder()
        .setColor(color)
        .setTitle('🃏 Blackjack — Verlaine Rôleplay')
        .addFields(
          { name: `🎰 Croupier ${status !== 'playing' ? `(${dv})` : ''}`, value: formatHand(dealerHand, status === 'playing'), inline: false },
          { name: `👤 Toi (${pv})`, value: formatHand(playerHand), inline: false },
          { name: '💰 Mise', value: `${bet.toLocaleString()} coins`, inline: true },
        )
        .setFooter({ text: `Verlaine Rôleplay • Blackjack | Solde: ${getEconomy(message.author.id).balance.toLocaleString()} coins` });
    };

    const makeRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('bj_hit').setLabel('🃏 Tirer').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('bj_stand').setLabel('✋ Rester').setStyle(ButtonStyle.Secondary),
    );

    if (handValue(playerHand) === 21) {
      const winAmount = Math.floor(bet * 2.5);
      addBalance(message.author.id, winAmount);
      const embed = makeEmbed('win').setDescription(`🎉 **Blackjack naturel !** Tu gagnes **+${winAmount.toLocaleString()} coins** !`);
      return message.reply({ embeds: [embed] });
    }

    const msg = await message.reply({ embeds: [makeEmbed()], components: [makeRow()] });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 30000 });

    collector.on('collect', async i => {
      if (i.customId === 'bj_hit') {
        playerHand.push(drawCard());
        const pv = handValue(playerHand);
        if (pv > 21) {
          collector.stop('bust');
          return i.update({ embeds: [makeEmbed('lose').setDescription(`💥 **Bust !** Tu dépasses 21 (${pv}). Tu perds **${bet.toLocaleString()} coins** !`)], components: [] });
        }
        if (pv === 21) collector.stop('stand');
        await i.update({ embeds: [makeEmbed()], components: [makeRow()] });
      } else {
        collector.stop('stand');
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'bust') return;
      while (handValue(dealerHand) < 17) dealerHand.push(drawCard());
      const pv = handValue(playerHand), dv = handValue(dealerHand);

      let result, winAmount = 0;
      if (dv > 21 || pv > dv) { result = 'win'; winAmount = bet * 2; addBalance(message.author.id, winAmount); }
      else if (pv === dv) { result = 'push'; addBalance(message.author.id, bet); }
      else result = 'lose';

      const desc = result === 'win' ? `🎉 Tu gagnes **+${winAmount.toLocaleString()} coins** !`
        : result === 'push' ? `🤝 Égalité ! Ta mise de **${bet.toLocaleString()} coins** est remboursée.`
        : `😢 Croupier gagne ! Tu perds **${bet.toLocaleString()} coins**.`;

      const finalEmbed = makeEmbed(result === 'push' ? 'playing' : result).setDescription(desc);
      msg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
    });
  },
};

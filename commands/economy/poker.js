const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

function getCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  return { s: suits[Math.floor(Math.random()*4)], v: values[Math.floor(Math.random()*13)] };
}
function cardVal(c) {
  if(['J','Q','K'].includes(c.v)) return 10;
  if(c.v==='A') return 14;
  return parseInt(c.v);
}
function hand3Rank(h) {
  const vals = h.map(cardVal).sort((a,b)=>b-a);
  const suits = h.map(c=>c.s);
  const flush = suits.every(s=>s===suits[0]);
  const straight = vals[0]-vals[1]===1 && vals[1]-vals[2]===1;
  const triple = vals[0]===vals[1]&&vals[1]===vals[2];
  const pair = vals[0]===vals[1]||vals[1]===vals[2];
  if(flush&&straight) return {rank:6,name:'Quinte Flush',mult:5};
  if(triple) return {rank:5,name:'Brelan',mult:3};
  if(flush) return {rank:4,name:'Couleur',mult:2};
  if(straight) return {rank:3,name:'Suite',mult:1.5};
  if(pair) return {rank:2,name:'Paire',mult:1};
  return {rank:1,name:'Carte haute',mult:0};
}

module.exports = {
  name: 'poker',
  description: 'Poker à 3 cartes contre le croupier',
  usage: '-poker <mise>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if(!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**. Usage: `-poker <mise>`');
    const eco = getEconomy(message.author.id);
    if(eco.balance<bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    const playerHand = [getCard(),getCard(),getCard()];
    const dealerHand = [getCard(),getCard(),getCard()];
    const pRank = hand3Rank(playerHand);
    const dRank = hand3Rank(dealerHand);

    const fmt = h => h.map(c=>`${c.v}${c.s}`).join('  ');

    let result, gain = 0;
    if(pRank.rank > dRank.rank) {
      result = '🏆 Victoire !';
      gain = Math.floor(bet*(1+pRank.mult));
      addBalance(message.author.id, gain);
    } else if(pRank.rank === dRank.rank) {
      result = '🤝 Égalité !';
      addBalance(message.author.id, bet);
      gain = bet;
    } else {
      result = '😢 Défaite';
    }

    const embed = new EmbedBuilder()
      .setColor(pRank.rank>dRank.rank ? config.colors.success : pRank.rank===dRank.rank ? config.colors.warning : config.colors.error)
      .setTitle(`🃏 Poker 3 Cartes — ${result}`)
      .addFields(
        { name: `👤 Vous — ${pRank.name}`, value: fmt(playerHand), inline: false },
        { name: `🎰 Croupier — ${dRank.name}`, value: fmt(dealerHand), inline: false },
        { name: '💰 Résultat', value: pRank.rank>dRank.rank ? `+${gain.toLocaleString()} coins` : pRank.rank===dRank.rank ? `Remboursé: ${bet.toLocaleString()} coins` : `-${bet.toLocaleString()} coins`, inline: true },
      )
      .setFooter({ text: 'Verlaine Rôleplay • Poker' });

    message.reply({ embeds: [embed] });
  },
};

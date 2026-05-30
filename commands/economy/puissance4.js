const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const ROWS = 6, COLS = 7;
const P1 = '🔴', P2 = '🟡', EMPTY = '⚫';

function createBoard() { return Array.from({length:ROWS},()=>Array(COLS).fill(EMPTY)); }

function dropPiece(board, col, piece) {
  for (let r = ROWS-1; r >= 0; r--) {
    if (board[r][col] === EMPTY) { board[r][col] = piece; return r; }
  }
  return -1;
}

function checkWin(board, piece) {
  for (let r=0;r<ROWS;r++) for(let c=0;c<COLS-3;c++) if([0,1,2,3].every(i=>board[r][c+i]===piece)) return true;
  for (let r=0;r<ROWS-3;r++) for(let c=0;c<COLS;c++) if([0,1,2,3].every(i=>board[r+i][c]===piece)) return true;
  for (let r=3;r<ROWS;r++) for(let c=0;c<COLS-3;c++) if([0,1,2,3].every(i=>board[r-i][c+i]===piece)) return true;
  for (let r=3;r<ROWS;r++) for(let c=3;c<COLS;c++) if([0,1,2,3].every(i=>board[r-i][c-i]===piece)) return true;
  return false;
}

module.exports = {
  name: 'puissance4',
  aliases: ['p4','connect4'],
  description: 'Jouer à Puissance 4 contre un autre joueur',
  usage: '-puissance4 <@user> <mise>',
  cooldown: 5,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const bet = parseInt(args[1]);
    if (!target||target.bot||target.id===message.author.id) return message.reply('❌ Mentionne un joueur valide.');
    if (!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**.');
    const e1 = getEconomy(message.author.id), e2 = getEconomy(target.id);
    if (e1.balance<bet) return message.reply('❌ Solde insuffisant.');
    if (e2.balance<bet) return message.reply(`❌ **${target.username}** n'a pas assez.`);

    removeBalance(message.author.id,bet); removeBalance(target.id,bet);

    const board = createBoard();
    const players = [{ user: message.author, piece: P1 }, { user: target, piece: P2 }];
    let turn = 0;

    const makeRows = () => Array.from({length:Math.ceil(COLS/5)},(_,i)=>
      new ActionRowBuilder().addComponents(
        Array.from({length:Math.min(5,COLS-i*5)},(_,j)=>{
          const col=i*5+j;
          return new ButtonBuilder().setCustomId(`p4_${col}`).setLabel(`${col+1}`).setStyle(ButtonStyle.Secondary);
        })
      )
    );

    const makeEmbed = () => new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle(`🔴🟡 Puissance 4 — Mise: ${bet}c`)
      .setDescription(board.map(r=>r.join('')).join('\n')+`\n\nTour de ${players[turn].user} (${players[turn].piece})`)
      .setFooter({text:'Verlaine Rôleplay • Puissance 4'});

    const msg = await message.reply({embeds:[makeEmbed()],components:makeRows()});
    const collector = msg.createMessageComponentCollector({filter:i=>i.user.id===players[turn].user.id,time:120000});

    collector.on('collect',async i=>{
      const col=parseInt(i.customId.split('_')[1]);
      const row=dropPiece(board,col,players[turn].piece);
      if(row===-1) return i.reply({content:'❌ Colonne pleine !',ephemeral:true});

      if(checkWin(board,players[turn].piece)){
        const w=players[turn].user;
        const l=players[1-turn].user;
        addBalance(w.id,bet*2);
        collector.stop('win');
        const e=new EmbedBuilder().setColor(config.colors.success)
          .setTitle(`🏆 ${w.username} remporte la partie !`)
          .setDescription(board.map(r=>r.join('')).join('\n')+`\n\n💰 **+${bet.toLocaleString()} coins** pour ${w} !`)
          .setFooter({text:'Verlaine Rôleplay • Puissance 4'});
        return i.update({embeds:[e],components:[]});
      }

      if(board.every(r=>r.every(c=>c!==EMPTY))){
        addBalance(message.author.id,bet); addBalance(target.id,bet);
        collector.stop('draw');
        const e=makeEmbed().setTitle('🤝 Match nul !').setDescription(board.map(r=>r.join('')).join('\n')+'\n\nMises remboursées.');
        return i.update({embeds:[e],components:[]});
      }

      turn=1-turn;
      collector.options.filter=j=>j.user.id===players[turn].user.id;
      await i.update({embeds:[makeEmbed()],components:makeRows()});
    });

    collector.on('end',(_,reason)=>{
      if(reason==='time'){
        addBalance(message.author.id,bet); addBalance(target.id,bet);
        msg.edit({embeds:[makeEmbed().setDescription('⏱️ Temps écoulé — mises remboursées.')],components:[]}).catch(()=>{});
      }
    });
  },
};

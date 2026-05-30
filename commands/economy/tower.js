const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const FLOORS = 10;
const mults = [1.2,1.5,2,2.5,3,4,5,7,10,15];

module.exports = {
  name: 'tower',
  description: 'Monte la tour en évitant les pièges, encaisse quand tu veux',
  usage: '-tower <mise>',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if(!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**.');
    const eco = getEconomy(message.author.id);
    if(eco.balance<bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    let floor = 0;
    let alive = true;

    const makeEmbed = (result='playing') => {
      const mult = mults[floor] || 1;
      const potential = Math.floor(bet*mult);
      const floors = Array.from({length:FLOORS},(_, i) => {
        const f = FLOORS-1-i;
        if(f < floor) return `✅ Étage ${f+1} — x${mults[f]}`;
        if(f === floor) return `👉 **Étage ${f+1} — x${mults[f]}** ← Vous êtes ici`;
        return `⬜ Étage ${f+1} — x${mults[f]}`;
      });
      return new EmbedBuilder()
        .setColor(result==='win'?config.colors.success:result==='lose'?config.colors.error:config.colors.economy)
        .setTitle('🏰 Tour — Verlaine Rôleplay')
        .setDescription(floors.join('\n'))
        .addFields({name:'💰 Gain potentiel',value:`${potential.toLocaleString()} coins (x${mult})`,inline:true})
        .setFooter({text:'Verlaine Rôleplay • Tour'});
    };

    const makeRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('tower_climb').setLabel('⬆️ Monter').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('tower_cashout').setLabel(`💸 Encaisser`).setStyle(ButtonStyle.Success),
    );

    const msg = await message.reply({embeds:[makeEmbed()],components:[makeRow()]});
    const collector = msg.createMessageComponentCollector({filter:i=>i.user.id===message.author.id,time:60000});

    collector.on('collect', async i => {
      if(i.customId==='tower_cashout') {
        const mult = mults[Math.max(0,floor-1)]||1;
        const win = Math.floor(bet*mult);
        addBalance(message.author.id, win);
        collector.stop('cashout');
        return i.update({embeds:[makeEmbed('win').setDescription(`💸 Encaissé à l'étage **${floor}** — **+${win.toLocaleString()} coins** !`)],components:[]});
      }
      const trapChance = 0.15 + floor*0.03;
      if(Math.random()<trapChance) {
        alive = false;
        collector.stop('trap');
        return i.update({embeds:[makeEmbed('lose').setDescription(`💥 **Piège déclenché à l'étage ${floor+1}** !\n\nTu perds **${bet.toLocaleString()} coins** !`)],components:[]});
      }
      floor++;
      if(floor>=FLOORS) {
        const win = Math.floor(bet*mults[FLOORS-1]);
        addBalance(message.author.id,win);
        collector.stop('top');
        return i.update({embeds:[makeEmbed('win').setDescription(`🏆 **Sommet atteint !** Tu gagnes **+${win.toLocaleString()} coins** !`)],components:[]});
      }
      await i.update({embeds:[makeEmbed()],components:[makeRow()]});
    });

    collector.on('end',(_, reason)=>{
      if(reason==='time') msg.edit({embeds:[makeEmbed('lose').setDescription('⏱️ Temps écoulé — partie expirée.')],components:[]}).catch(()=>{});
    });
  },
};

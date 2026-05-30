const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const horses = ['🐎 Thunder','🐎 Lightning','🐎 Storm','🐎 Blaze','🐎 Shadow'];

module.exports = {
  name: 'course',
  description: 'Lancer une course de chevaux',
  usage: '-course <mise> <durée_s> [#channel]',
  cooldown: 10,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    const duration = parseInt(args[1]) || 30;
    if (!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**. Usage: `-course <mise> <durée>`');

    const bets = {};
    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('🏇 Course de Chevaux !')
      .setDescription(
        `Pariez sur un cheval avant le départ !\n\n` +
        horses.map((h,i)=>`**${i+1}.** ${h}`).join('\n') +
        `\n\n💰 Mise : **${bet.toLocaleString()} coins** | ⏰ Départ dans **${duration}s**`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Course' });

    const row = new ActionRowBuilder().addComponents(
      horses.map((h,i)=>new ButtonBuilder().setCustomId(`horse_${i}`).setLabel(`${i+1}. ${h.split(' ')[1]}`).setStyle(ButtonStyle.Primary))
    );

    const msg = await message.reply({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ time: duration * 1000 });

    collector.on('collect', async i => {
      if (bets[i.user.id]) return i.reply({ content: '❌ Tu as déjà parié !', ephemeral: true });
      const eco = getEconomy(i.user.id);
      if (eco.balance < bet) return i.reply({ content: '❌ Solde insuffisant !', ephemeral: true });
      removeBalance(i.user.id, bet);
      bets[i.user.id] = parseInt(i.customId.split('_')[1]);
      await i.reply({ content: `✅ Tu as parié sur **${horses[bets[i.user.id]]}** !`, ephemeral: true });
    });

    collector.on('end', async () => {
      const winner = Math.floor(Math.random() * horses.length);
      const progress = Array(horses.length).fill(0);
      const lines = [];

      for (let step = 0; step < 8; step++) {
        for (let h = 0; h < horses.length; h++) progress[h] += Math.random() * 3;
      }
      progress[winner] = Math.max(...progress) + 1;

      const winners = Object.entries(bets).filter(([,h])=>h===winner);
      const totalPool = Object.keys(bets).length * bet;
      const perWinner = winners.length > 0 ? Math.floor(totalPool / winners.length) : 0;

      for (const [uid] of winners) addBalance(uid, perWinner);

      const resultEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🏆 Résultats de la course !')
        .setDescription(
          horses.map((h,i)=>`${i===winner?'🥇':'  '} ${h}`).join('\n') +
          `\n\n**Gagnant : ${horses[winner]}** 🏆\n` +
          (winners.length ? `${winners.length} gagnant(s) — **+${perWinner.toLocaleString()} coins** chacun !` : `Aucun parieur gagnant.`)
        )
        .setFooter({ text: 'Verlaine Rôleplay • Course' });

      msg.edit({ embeds: [resultEmbed], components: [] }).catch(()=>{});
    });
  },
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'gunfight',
  description: 'Lance un gunfight contre un autre joueur',
  usage: '-gunfight <@user> <mise>',
  cooldown: 5,

  async execute(message, args) {
    const target = message.mentions.users.first();
    const bet = parseInt(args[1]);
    if (!target || target.bot || target.id === message.author.id) return message.reply('❌ Mentionne un joueur valide.');
    if (!bet || bet < 10) return message.reply('❌ Mise minimum : **10 coins**.');

    const eco1 = getEconomy(message.author.id);
    const eco2 = getEconomy(target.id);
    if (eco1.balance < bet) return message.reply(`❌ Solde insuffisant.`);
    if (eco2.balance < bet) return message.reply(`❌ **${target.username}** n'a pas assez de coins.`);

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('🔫 Défi Gunfight !')
      .setDescription(
        `**${message.author.username}** défie **${target.username}** en gunfight !\n\n` +
        `💰 Mise : **${bet.toLocaleString()} coins**\n\n` +
        `${target}, acceptes-tu le défi ? *(30 secondes pour répondre)*`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Gunfight' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('gf_accept').setLabel('✅ Accepter').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('gf_deny').setLabel('❌ Refuser').setStyle(ButtonStyle.Danger),
    );

    const msg = await message.reply({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === target.id, time: 30000 });

    collector.on('collect', async i => {
      if (i.customId === 'gf_deny') {
        collector.stop();
        return i.update({ embeds: [embed.setDescription(`❌ **${target.username}** a refusé le défi.`).setColor(config.colors.error)], components: [] });
      }

      collector.stop('accepted');
      await i.deferUpdate();

      const steps = ['🔫 Les joueurs se positionnent...', '👀 Ils se regardent dans les yeux...', '⚡ Prêts...', '💥 FEU !'];
      let current = 0;

      const stepEmbed = new EmbedBuilder().setColor(config.colors.warning).setTitle('🔫 Gunfight en cours !');

      const interval = setInterval(async () => {
        if (current < steps.length) {
          stepEmbed.setDescription(steps.slice(0, current + 1).join('\n'));
          await msg.edit({ embeds: [stepEmbed], components: [] }).catch(() => {});
          current++;
        } else {
          clearInterval(interval);
          const winner = Math.random() < 0.5 ? message.author : target;
          const loser = winner.id === message.author.id ? target : message.author;

          removeBalance(loser.id, bet);
          addBalance(winner.id, bet);

          const resultEmbed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle('🏆 Gunfight terminé !')
            .setDescription(
              `**${winner.username}** 🔫 dégaine le premier et remporte le duel !\n\n` +
              `💰 **+${bet.toLocaleString()} coins** pour ${winner.username} !`
            )
            .setFooter({ text: 'Verlaine Rôleplay • Gunfight' });
          await msg.edit({ embeds: [resultEmbed] }).catch(() => {});
        }
      }, 1200);
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        msg.edit({ embeds: [embed.setDescription(`⏱️ Le défi a expiré.`).setColor(config.colors.error)], components: [] }).catch(() => {});
      }
    });
  },
};

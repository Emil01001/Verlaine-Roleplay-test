const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'pot',
  description: 'Lance une cagnotte de serveur',
  usage: '-pot <objectif> <durée_s> <gain_bonus>',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const goal = parseInt(args[0]);
    const duration = parseInt(args[1]) || 120;
    const bonus = parseInt(args[2]) || 1000;
    if (!goal||goal<100) return message.reply('❌ Objectif minimum : **100 coins**.');

    let pool = 0;
    const contributors = new Map();

    const updateEmbed = () => new EmbedBuilder()
      .setColor(pool >= goal ? config.colors.success : config.colors.economy)
      .setTitle('💰 Cagnotte Serveur !')
      .setDescription(
        `Contribuez à la cagnotte pour atteindre l'objectif !\n\n` +
        `**Objectif :** ${goal.toLocaleString()} coins\n` +
        `**Collecté :** ${pool.toLocaleString()} coins (${Math.floor(pool/goal*100)}%)\n` +
        `**Bonus si objectif atteint :** +${bonus.toLocaleString()} coins à partager\n\n` +
        `${contributors.size > 0 ? `**Contributeurs :** ${contributors.size}` : '*Personne n\'a encore contribué...*'}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Clique sur **Contribuer** pour participer !`
      )
      .setFooter({ text: `Verlaine Rôleplay • Cagnotte | Fin dans ${duration}s` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pot_50').setLabel('50 coins').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('pot_200').setLabel('200 coins').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('pot_500').setLabel('500 coins').setStyle(ButtonStyle.Primary),
    );

    const msg = await message.reply({ embeds: [updateEmbed()], components: [row] });
    const collector = msg.createMessageComponentCollector({ time: duration * 1000 });

    collector.on('collect', async i => {
      const amount = parseInt(i.customId.split('_')[1]);
      const eco = getEconomy(i.user.id);
      if (eco.balance < amount) return i.reply({ content: '❌ Solde insuffisant !', ephemeral: true });
      removeBalance(i.user.id, amount);
      pool += amount;
      contributors.set(i.user.id, (contributors.get(i.user.id) || 0) + amount);
      await i.reply({ content: `✅ Tu as contribué **${amount} coins** !`, ephemeral: true });
      await msg.edit({ embeds: [updateEmbed()], components: [row] });
      if (pool >= goal) collector.stop('goal');
    });

    collector.on('end', async (_, reason) => {
      const totalBonus = reason === 'goal' ? bonus : 0;
      const totalPool = pool + totalBonus;
      const perPerson = contributors.size > 0 ? Math.floor(totalPool / contributors.size) : 0;
      for (const [uid] of contributors) addBalance(uid, perPerson);

      const finalEmbed = new EmbedBuilder()
        .setColor(reason === 'goal' ? config.colors.success : config.colors.warning)
        .setTitle(reason === 'goal' ? '🎉 Objectif atteint !' : '⏱️ Cagnotte terminée !')
        .setDescription(
          `Pool final : **${totalPool.toLocaleString()} coins**\n` +
          `${contributors.size} contributeur(s) → **${perPerson.toLocaleString()} coins** chacun !`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Cagnotte' });
      msg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
    });
  },
};

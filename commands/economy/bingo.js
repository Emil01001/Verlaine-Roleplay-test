const { EmbedBuilder } = require('discord.js');
const { addBalance } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'bingo',
  description: 'Lance un bingo (Admin seulement)',
  usage: '-bingo <gain> <durée_en_secondes>',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const gain = parseInt(args[0]);
    const duration = parseInt(args[1]) || 60;
    if (!gain || gain < 1) return message.reply('❌ Spécifie un gain valide.');

    const number = Math.floor(Math.random() * 100) + 1;
    const endsAt = Date.now() + duration * 1000;

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('🎱 BINGO !')
      .setDescription(
        `Un bingo a été lancé ! Devinez le **nombre exact entre 1 et 100** !\n\n` +
        `💰 **Récompense :** ${gain.toLocaleString()} coins\n` +
        `⏰ **Fin dans :** ${duration} secondes\n\n` +
        `Envoyez votre réponse dans ce salon avec le format : **-guess <nombre>**`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Bingo' })
      .setTimestamp();

    const msg = await message.channel.send({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: m => !m.author.bot && m.content.startsWith('-guess'),
      time: duration * 1000,
    });

    let winner = null;
    collector.on('collect', async m => {
      const guess = parseInt(m.content.split(' ')[1]);
      if (isNaN(guess)) return;
      if (guess === number) {
        winner = m.author;
        collector.stop('found');
        addBalance(m.author.id, gain);
        const winEmbed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setTitle('🎉 BINGO — Gagnant trouvé !')
          .setDescription(`**${m.author.username}** a trouvé le nombre **${number}** !\n\n💰 **+${gain.toLocaleString()} coins** remportés !`)
          .setFooter({ text: 'Verlaine Rôleplay • Bingo' });
        msg.edit({ embeds: [winEmbed] });
      }
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'found') {
        const endEmbed = new EmbedBuilder()
          .setColor(config.colors.error)
          .setTitle('⏱️ BINGO — Temps écoulé !')
          .setDescription(`Personne n'a trouvé le nombre mystère : **${number}**\n\nMeilleure chance la prochaine fois !`)
          .setFooter({ text: 'Verlaine Rôleplay • Bingo' });
        msg.edit({ embeds: [endEmbed] });
      }
    });
  },
};

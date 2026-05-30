const { EmbedBuilder } = require('discord.js');
const { addBalance } = require('../../database/db');
const config = require('../../config');

const words = ['VERLAINE','ROLEPLAY','DISCORD','SERVEUR','JOUEUR','ÉCONOMIE','CASINO','VICTOIRE','ARGENT','DRAGON','CHEVALIER','CHÂTEAU','FRANCE','LIBERTÉ'];

module.exports = {
  name: 'scrabble',
  description: 'Lance un scrabble — trouve le mot anagramme',
  usage: '-scrabble <gain> <durée_s>',

  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Permission insuffisante.');
    const gain = parseInt(args[0]) || 500;
    const duration = parseInt(args[1]) || 60;

    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split('').sort(() => Math.random()-0.5).join('');

    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('🔤 Scrabble !')
      .setDescription(
        `Trouve le mot caché dans cet anagramme !\n\n` +
        `**Anagramme :** \`${scrambled}\`\n\n` +
        `💰 Récompense : **${gain.toLocaleString()} coins** au premier !\n` +
        `⏰ Durée : **${duration} secondes**\n\n` +
        `Envoie ta réponse directement dans le salon !`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Scrabble' });

    await message.channel.send({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: m => !m.author.bot && m.content.toUpperCase() === word,
      time: duration * 1000,
      max: 1,
    });

    collector.on('collect', async m => {
      addBalance(m.author.id, gain);
      const winEmbed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🎉 Mot trouvé !')
        .setDescription(`**${m.author.username}** a trouvé le mot **${word}** !\n\n💰 **+${gain.toLocaleString()} coins** remportés !`)
        .setFooter({ text: 'Verlaine Rôleplay • Scrabble' });
      m.channel.send({ embeds: [winEmbed] });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        message.channel.send({ embeds: [new EmbedBuilder().setColor(config.colors.error).setTitle('⏱️ Scrabble terminé !').setDescription(`Personne n'a trouvé ! Le mot était : **${word}**`)] });
      }
    });
  },
};

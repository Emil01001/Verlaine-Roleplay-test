const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

const responses = [
  { text: '✅ Oui, absolument !', color: config.colors.success },
  { text: '✅ C\'est certain.', color: config.colors.success },
  { text: '✅ Sans aucun doute.', color: config.colors.success },
  { text: '✅ Très probablement.', color: config.colors.success },
  { text: '🟡 Les signes pointent vers oui.', color: config.colors.warning },
  { text: '🟡 Réponse floue, essaie encore.', color: config.colors.warning },
  { text: '🟡 Pose la question plus tard.', color: config.colors.warning },
  { text: '🟡 Ne compte pas dessus.', color: config.colors.warning },
  { text: '❌ Non, absolument pas.', color: config.colors.error },
  { text: '❌ Mes sources disent non.', color: config.colors.error },
  { text: '❌ Très peu probable.', color: config.colors.error },
  { text: '❌ Sûrement pas.', color: config.colors.error },
];

module.exports = {
  name: '8ball',
  aliases: ['boule', 'oracle'],
  description: 'Poser une question à la boule magique',
  usage: '-8ball <question>',
  async execute(message, args) {
    const question = args.join(' ');
    if (!question) return message.reply('❌ Pose une question !');
    const r = responses[Math.floor(Math.random() * responses.length)];
    const embed = new EmbedBuilder().setColor(r.color)
      .setTitle('🎱 Boule Magique')
      .addFields(
        { name: '❓ Question', value: question, inline: false },
        { name: '🔮 Réponse', value: r.text, inline: false },
      )
      .setFooter({ text: 'Verlaine Rôleplay' });
    message.reply({ embeds: [embed] });
  },
};

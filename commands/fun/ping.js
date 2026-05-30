const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'ping',
  description: 'Vérifier la latence du bot',
  usage: '-ping',
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Calcul...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    const color = latency < 100 ? config.colors.success : latency < 300 ? config.colors.warning : config.colors.error;

    const embed = new EmbedBuilder().setColor(color)
      .setTitle('🏓 Pong !')
      .addFields(
        { name: '📡 Latence', value: `**${latency}ms**`, inline: true },
        { name: '💻 API Discord', value: `**${apiLatency}ms**`, inline: true },
        { name: '⚡ Statut', value: latency < 100 ? '🟢 Excellent' : latency < 300 ? '🟡 Correct' : '🔴 Lent', inline: true },
      )
      .setFooter({ text: 'Verlaine Rôleplay' });
    sent.edit({ content: null, embeds: [embed] });
  },
};

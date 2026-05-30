const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'wakeup',
  aliases: ['réveil', 'bouge'],
  description: 'Déplacer un membre dans toutes les salons vocaux',
  usage: '-wakeup <@utilisateur> <durée_en_secondes>',

  async execute(message, args) {
    if (!message.member.permissions.has('MoveMembers')) {
      return message.reply('❌ Tu n\'as pas la permission de déplacer des membres.');
    }

    const target = message.mentions.members.first();
    const duration = parseInt(args[1]) || 10;

    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (!target.voice.channel) return message.reply(`❌ **${target.user.username}** n'est pas dans un salon vocal.`);
    if (duration < 5 || duration > 120) return message.reply('❌ Durée entre **5** et **120** secondes.');

    const voiceChannels = message.guild.channels.cache.filter(c => c.type === 2 && c.permissionsFor(target)?.has('Connect'));
    if (voiceChannels.size < 2) return message.reply('❌ Pas assez de salons vocaux.');

    const channelList = [...voiceChannels.values()];
    const original = target.voice.channel;
    let i = 0;
    let count = 0;
    const maxMoves = Math.min(Math.floor(duration / 1.5), 30);

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('⏰ Wake Up !')
      .setDescription(`**${target.user.username}** va être déplacé dans tous les salons vocaux pendant **${duration}s** !`)
      .setFooter({ text: `Lancé par ${message.author.username} | Verlaine Rôleplay` });

    await message.reply({ embeds: [embed] });

    const interval = setInterval(async () => {
      if (count >= maxMoves || !target.voice.channel) {
        clearInterval(interval);
        if (target.voice.channel) {
          await target.voice.setChannel(original).catch(() => {});
        }
        const doneEmbed = new EmbedBuilder()
          .setColor(config.colors.success)
          .setDescription(`✅ **${target.user.username}** a été réveillé et remis dans son salon original !`)
          .setFooter({ text: 'Verlaine Rôleplay • Wake Up' });
        message.channel.send({ embeds: [doneEmbed] });
        return;
      }

      const next = channelList[i % channelList.length];
      await target.voice.setChannel(next).catch(() => clearInterval(interval));
      i++; count++;
    }, Math.max(Math.floor(duration * 1000 / maxMoves), 1500));
  },
};

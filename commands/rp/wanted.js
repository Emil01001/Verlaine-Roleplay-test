const { EmbedBuilder } = require('discord.js');
const { getRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'wanted',
  description: 'Voir votre niveau wanted RP',
  usage: '-wanted [@utilisateur]',
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const p = getRpProfile(target.id);
    const stars = '⭐'.repeat(p.wanted||0) + '☆'.repeat(5-(p.wanted||0));

    const embed = new EmbedBuilder().setColor(p.wanted>=3 ? config.colors.error : p.wanted>=1 ? config.colors.warning : config.colors.success)
      .setTitle(`🚔 Niveau Wanted — ${target.username}`)
      .setDescription(
        `**Niveau :** ${stars} (${p.wanted||0}/5)\n\n` +
        (p.wanted===0 ? '✅ Citoyen exemplaire — aucun antécédent !' :
        p.wanted<=2 ? '⚠️ Suspect — les forces de l\'ordre vous surveillent.' :
        '🚨 TRÈS RECHERCHÉ — Danger public majeur !')
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

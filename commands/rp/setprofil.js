const { EmbedBuilder } = require('discord.js');
const { updateRpProfile } = require('../../database/db');
const config = require('../../config');

module.exports = {
  name: 'setprofil',
  aliases: ['editprofil', 'setrp'],
  description: 'Modifier votre profil RP',
  usage: '-setprofil <nom|age|job|description> <valeur>',

  async execute(message, args) {
    const field = args[0]?.toLowerCase();
    const value = args.slice(1).join(' ');
    if (!field || !value) return message.reply('❌ Usage: `-setprofil <champ> <valeur>`\nChamps: `nom`, `age`, `job`, `description`');

    const allowed = { nom: 'name', age: 'age', job: 'job', description: 'description' };
    if (!allowed[field]) return message.reply(`❌ Champ inconnu. Champs: ${Object.keys(allowed).join(', ')}`);

    const update = {};
    if (field === 'age') {
      const age = parseInt(value);
      if (isNaN(age) || age < 0 || age > 120) return message.reply('❌ Âge invalide (0-120).');
      update.age = age;
    } else {
      update[allowed[field]] = value.slice(0, 500);
    }

    updateRpProfile(message.author.id, update);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setDescription(`✅ **${field.charAt(0).toUpperCase()+field.slice(1)}** mis à jour : **${value}**`)
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
};

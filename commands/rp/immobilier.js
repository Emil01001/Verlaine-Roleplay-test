const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile, db } = require('../../database/db');
const config = require('../../config');

const properties = [
  { id: 'studio', name: 'Studio', address: '12 Rue de la Paix', price: 30000, rooms: 1, income: 200 },
  { id: 'appartement', name: 'Appartement T2', address: '45 Avenue Montaigne', price: 75000, rooms: 2, income: 500 },
  { id: 'maison', name: 'Maison individuelle', address: '8 Rue des Lilas', price: 180000, rooms: 4, income: 1200 },
  { id: 'villa', name: 'Villa avec piscine', address: 'Route de la Corniche', price: 450000, rooms: 6, income: 3000 },
  { id: 'penthouse', name: 'Penthouse luxueux', address: 'Tour Montparnasse, 56ème', price: 1200000, rooms: 8, income: 8000 },
  { id: 'domaine', name: 'Domaine privé', address: 'Domaine de Versailles', price: 3000000, rooms: 15, income: 25000 },
];

module.exports = {
  name: 'immobilier',
  aliases: ['immo', 'maison', 'habitat'],
  description: 'Acheter et gérer vos propriétés RP',
  usage: '-immobilier [acheter <id>|mes-biens]',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase() || 'liste';

    if (sub === 'mes-biens') {
      const owned = db.prepare('SELECT * FROM rp_houses WHERE user_id = ?').all(message.author.id);
      if (!owned.length) return message.reply('❌ Tu ne possèdes aucune propriété.');
      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🏠 Mes Propriétés')
        .setDescription(owned.map(h => `🏠 **${h.address}** — ${h.rooms} pièces`).join('\n'))
        .setFooter({ text: 'Verlaine Rôleplay • Immobilier' });
      return message.reply({ embeds: [embed] });
    }

    const propId = args[1]?.toLowerCase();
    if (sub === 'acheter' && propId) {
      const prop = properties.find(p => p.id === propId);
      if (!prop) return message.reply('❌ Propriété introuvable.');
      const profile = getRpProfile(message.author.id);
      if (profile.money < prop.price) return message.reply(`❌ Solde RP insuffisant ! Il te faut **${prop.price.toLocaleString()} €**.`);

      db.prepare('INSERT INTO rp_houses (user_id, address, price, rooms) VALUES (?, ?, ?, ?)').run(message.author.id, prop.address, prop.price, prop.rooms);
      updateRpProfile(message.author.id, { money: profile.money - prop.price, house: prop.address });

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🎉 Propriété achetée !')
        .setDescription(`Tu es maintenant propriétaire de **${prop.name}** au **${prop.address}** !\n\n💰 Prix payé : **${prop.price.toLocaleString()} €**\n🏠 ${prop.rooms} pièces\n💵 Revenu : ${prop.income.toLocaleString()} €/h`)
        .setFooter({ text: 'Verlaine Rôleplay • Immobilier' });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setTitle('🏢 Agence Immobilière — Verlaine Rôleplay')
      .setDescription(
        `**Propriétés disponibles :**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        properties.map(p => `🏠 **${p.name}** (\`${p.id}\`)\n📍 *${p.address}* — ${p.rooms} pièce(s)\n💰 **${p.price.toLocaleString()} €** | Revenu: ${p.income.toLocaleString()} €/h`).join('\n\n') +
        `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nAchète avec \`-immobilier acheter <id>\``
      )
      .setFooter({ text: 'Verlaine Rôleplay • Immobilier' });
    message.reply({ embeds: [embed] });
  },
};

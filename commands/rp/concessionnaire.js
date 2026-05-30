const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile, db } = require('../../database/db');
const config = require('../../config');

const vehicles = [
  { id: 'clio', brand: 'Renault', model: 'Clio', price: 8000, speed: 180, category: 'citadine' },
  { id: 'golf', brand: 'Volkswagen', model: 'Golf', price: 15000, speed: 210, category: 'compacte' },
  { id: 'serie3', brand: 'BMW', model: 'Série 3', price: 35000, speed: 250, category: 'berline' },
  { id: 'mustang', brand: 'Ford', model: 'Mustang', price: 55000, speed: 280, category: 'sport' },
  { id: 'ferrari', brand: 'Ferrari', model: 'F488', price: 250000, speed: 330, category: 'supercar' },
  { id: 'lambo', brand: 'Lamborghini', model: 'Huracán', price: 300000, speed: 340, category: 'supercar' },
  { id: 'range', brand: 'Land Rover', model: 'Range Rover', price: 95000, speed: 220, category: 'suv' },
  { id: 'tesla', brand: 'Tesla', model: 'Model S', price: 80000, speed: 260, category: 'électrique' },
  { id: 'porsche', brand: 'Porsche', model: '911', price: 130000, speed: 310, category: 'sport' },
  { id: 'mclaren', brand: 'McLaren', model: '720S', price: 280000, speed: 341, category: 'supercar' },
];

function genPlate() {
  const letters = () => Array.from({length:2},()=>String.fromCharCode(65+Math.floor(Math.random()*26))).join('');
  const nums = () => String(Math.floor(Math.random()*900)+100);
  return `${letters()}-${nums()}-${letters()}`;
}

module.exports = {
  name: 'concessionnaire',
  aliases: ['conces', 'garage', 'cars'],
  description: 'Acheter et gérer vos véhicules RP',
  usage: '-concessionnaire [acheter|mes-voitures|vendre]',

  async execute(message, args) {
    const sub = args[0]?.toLowerCase() || 'liste';

    if (sub === 'mes-voitures' || sub === 'mv') {
      const owned = db.prepare('SELECT * FROM rp_vehicles WHERE user_id = ?').all(message.author.id);
      if (!owned.length) return message.reply('❌ Tu ne possèdes aucun véhicule. Achète-en avec `-concessionnaire acheter`.');

      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🚗 Mes Véhicules')
        .setDescription(owned.map(v => `🔑 **${v.brand} ${v.model}** | Plaque: \`${v.plate}\` | Vitesse max: ${v.speed} km/h`).join('\n'))
        .setFooter({ text: 'Verlaine Rôleplay • Concessionnaire' });
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'acheter') {
      const cat = args[1]?.toLowerCase();
      const list = cat ? vehicles.filter(v => v.category === cat) : vehicles;

      const embed = new EmbedBuilder()
        .setColor(config.colors.rp)
        .setTitle('🚗 Concessionnaire — Verlaine Rôleplay')
        .setDescription(
          `**Véhicules disponibles :**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          list.map(v => `🚗 **${v.brand} ${v.model}** — \`${v.price.toLocaleString()} €\` | ${v.speed} km/h | *${v.category}*`).join('\n') +
          `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nAchète avec \`-concessionnaire acheter <id>\``
        )
        .setFooter({ text: 'Verlaine Rôleplay • Concessionnaire' });
      return message.reply({ embeds: [embed] });
    }

    const vehicleId = args[1]?.toLowerCase();
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return message.reply('❌ Véhicule introuvable. Utilise `-concessionnaire acheter` pour voir la liste.');

      const profile = getRpProfile(message.author.id);
      if (profile.money < vehicle.price) {
        return message.reply(`❌ Solde RP insuffisant ! Il te faut **${vehicle.price.toLocaleString()} €** (tu as **${profile.money.toLocaleString()} €**).`);
      }

      const plate = genPlate();
      db.prepare('INSERT INTO rp_vehicles (user_id, brand, model, price, speed, plate) VALUES (?, ?, ?, ?, ?, ?)').run(
        message.author.id, vehicle.brand, vehicle.model, vehicle.price, vehicle.speed, plate
      );
      updateRpProfile(message.author.id, { money: profile.money - vehicle.price, vehicle: `${vehicle.brand} ${vehicle.model}` });

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🎉 Véhicule acheté !')
        .setDescription(
          `Tu es maintenant propriétaire d'une **${vehicle.brand} ${vehicle.model}** ! 🔑\n\n` +
          `🚗 Plaque : \`${plate}\`\n` +
          `💰 Prix payé : **${vehicle.price.toLocaleString()} €**\n` +
          `⚡ Vitesse max : **${vehicle.speed} km/h**`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Concessionnaire' });
      return message.reply({ embeds: [embed] });
    }

    // Default: show categories
    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setTitle('🚗 Concessionnaire — Verlaine Rôleplay')
      .setDescription(
        `Bienvenue au concessionnaire de **Verlaine Rôleplay** !\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `\`-concessionnaire acheter\` — Voir tous les véhicules\n` +
        `\`-concessionnaire acheter <id>\` — Acheter un véhicule\n` +
        `\`-concessionnaire mes-voitures\` — Voir mes véhicules\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `**Catégories :**\ncitadine | compacte | berline | sport | supercar | suv | électrique`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Concessionnaire' });
    message.reply({ embeds: [embed] });
  },
};

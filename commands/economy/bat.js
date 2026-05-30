const { EmbedBuilder } = require('discord.js');
const { getEconomy, addBalance, db } = require('../../database/db');
const config = require('../../config');

const buildings = {
  maison: { name: 'Petite Maison', emoji: '🏠', income: 500 },
  appartement: { name: 'Appartement', emoji: '🏢', income: 1500 },
  immeuble: { name: 'Immeuble', emoji: '🏬', income: 5000 },
  hotel: { name: 'Hôtel', emoji: '🏨', income: 15000 },
};

module.exports = {
  name: 'bat',
  aliases: ['patrimoine', 'batiments'],
  description: 'Gérer votre patrimoine immobilier',
  usage: '-bat [collect]',

  async execute(message, args) {
    const eco = getEconomy(message.author.id);
    const owned = JSON.parse(eco.buildings || '{}');
    const lastCollect = eco.work_cooldown || 0;

    if (Object.keys(owned).length === 0) {
      return message.reply('❌ Tu ne possèdes aucun bâtiment. Achète-en avec `-buy`.');
    }

    if (args[0] === 'collect' || args[0] === 'collecter') {
      const now = Date.now();
      const hoursElapsed = Math.min((now - (eco.work_cooldown || now - 3600000)) / 3600000, 24);
      let total = 0;

      for (const [key, qty] of Object.entries(owned)) {
        if (buildings[key]) total += Math.floor(buildings[key].income * qty * hoursElapsed);
      }

      if (total === 0) return message.reply('❌ Rien à collecter pour l\'instant !');

      addBalance(message.author.id, total);
      db.prepare('UPDATE economy SET work_cooldown = ? WHERE user_id = ?').run(now, message.author.id);

      const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🏛️ Revenus immobiliers collectés !')
        .setDescription(`Tu as collecté **+${total.toLocaleString()} coins** de revenus sur **${hoursElapsed.toFixed(1)}h** !`)
        .setFooter({ text: 'Verlaine Rôleplay • Patrimoine' });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('🏛️ Patrimoine Immobilier')
      .setDescription('Voici vos propriétés :\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
        Object.entries(owned).map(([key, qty]) => {
          const b = buildings[key];
          if (!b) return null;
          return { name: `${b.emoji} ${b.name}`, value: `Quantité : **${qty}** | Revenu : **${(b.income * qty).toLocaleString()} coins/h**`, inline: false };
        }).filter(Boolean)
      )
      .addFields({ name: '💡 Astuce', value: 'Utilise `-bat collect` pour collecter vos revenus (max 24h).', inline: false })
      .setFooter({ text: 'Verlaine Rôleplay • Patrimoine' });

    message.reply({ embeds: [embed] });
  },
};

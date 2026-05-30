const { EmbedBuilder } = require('discord.js');
const { getEconomy, removeBalance, db } = require('../../database/db');
const config = require('../../config');

const shop = [
  { id: 'antirob', name: 'Anti-Rob', emoji: '🛡️', price: 5000, description: 'Protège contre les vols', category: 'protection' },
  { id: 'wagon', name: 'Wagon', emoji: '🚃', price: 8000, description: 'Permet d\'accéder à la mine', category: 'outil' },
  { id: 'maison', name: 'Petite Maison', emoji: '🏠', price: 25000, description: 'Rapport: 500c/h', category: 'batiment' },
  { id: 'appartement', name: 'Appartement', emoji: '🏢', price: 75000, description: 'Rapport: 1500c/h', category: 'batiment' },
  { id: 'immeuble', name: 'Immeuble', emoji: '🏬', price: 200000, description: 'Rapport: 5000c/h', category: 'batiment' },
  { id: 'hotel', name: 'Hôtel', emoji: '🏨', price: 500000, description: 'Rapport: 15000c/h', category: 'batiment' },
];

module.exports = {
  name: 'buy',
  aliases: ['acheter'],
  description: 'Acheter des objets ou bâtiments',
  usage: '-buy <objet|liste>',

  async execute(message, args) {
    if (!args[0] || args[0] === 'liste') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.economy)
        .setTitle('🛒 Boutique — Verlaine Rôleplay')
        .setDescription(
          `**Objets disponibles à l'achat :**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          shop.map(item => `${item.emoji} **${item.name}** — \`${item.price.toLocaleString()}\` coins\n*${item.description}*`).join('\n\n') +
          `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nUtilise \`-buy <nom>\` pour acheter.`
        )
        .setFooter({ text: 'Verlaine Rôleplay • Boutique' });
      return message.reply({ embeds: [embed] });
    }

    const itemName = args.join(' ').toLowerCase();
    const item = shop.find(i => i.id === itemName || i.name.toLowerCase() === itemName);
    if (!item) return message.reply(`❌ Objet \`${itemName}\` introuvable. Utilise \`-buy liste\` pour voir les articles disponibles.`);

    const eco = getEconomy(message.author.id);
    if (eco.balance < item.price) {
      return message.reply(`❌ Tu n'as pas assez de coins ! Il te faut **${item.price.toLocaleString()}** coins (tu en as **${eco.balance.toLocaleString()}**).`);
    }

    if (item.id === 'antirob') {
      if (eco.has_antirob) return message.reply('❌ Tu possèdes déjà un Anti-Rob !');
      db.prepare('UPDATE economy SET has_antirob = 1 WHERE user_id = ?').run(message.author.id);
    } else if (item.id === 'wagon') {
      if (eco.has_wagon) return message.reply('❌ Tu possèdes déjà un wagon !');
      db.prepare('UPDATE economy SET has_wagon = 1 WHERE user_id = ?').run(message.author.id);
    } else {
      const buildings = JSON.parse(eco.buildings || '{}');
      buildings[item.id] = (buildings[item.id] || 0) + 1;
      db.prepare('UPDATE economy SET buildings = ? WHERE user_id = ?').run(JSON.stringify(buildings), message.author.id);
    }

    removeBalance(message.author.id, item.price);

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('✅ Achat réussi !')
      .setDescription(
        `Tu as acheté **${item.emoji} ${item.name}** pour **${item.price.toLocaleString()} coins** !\n\n` +
        `*${item.description}*`
      )
      .setFooter({ text: 'Verlaine Rôleplay • Boutique' });
    message.reply({ embeds: [embed] });
  },
};

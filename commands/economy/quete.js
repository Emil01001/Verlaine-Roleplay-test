const { EmbedBuilder } = require('discord.js');
const { db, addBalance } = require('../../database/db');
const config = require('../../config');

const quests = [
  { id: 'work5', name: 'Travailleur acharné', description: 'Travailler 5 fois', reward: 500, max: 5, track: 'work' },
  { id: 'daily3', name: 'Assidu', description: 'Récupérer le daily 3 fois', reward: 800, max: 3, track: 'daily' },
  { id: 'rob3', name: 'Bandit', description: 'Tenter de voler 3 fois', reward: 600, max: 3, track: 'rob' },
  { id: 'slots10', name: 'Joueur compulsif', description: 'Jouer 10 fois aux slots', reward: 1000, max: 10, track: 'slots' },
  { id: 'balance10k', name: 'Millionnaire en herbe', description: 'Avoir 10 000 coins', reward: 2000, max: 1, track: 'balance10k' },
];

module.exports = {
  name: 'quete',
  aliases: ['quest', 'quêtes'],
  description: 'Voir et accomplir vos quêtes',
  usage: '-quete',

  async execute(message) {
    const userId = message.author.id;

    const questData = quests.map(q => {
      const row = db.prepare('SELECT * FROM quests WHERE user_id = ? AND quest_id = ?').get(userId, q.id) || { progress: 0, completed: 0 };
      return { ...q, progress: row.progress, completed: row.completed };
    });

    const embed = new EmbedBuilder()
      .setColor(config.colors.economy)
      .setTitle('📜 Quêtes — Verlaine Rôleplay')
      .setDescription('Accomplis des quêtes pour gagner des coins !\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
        questData.map(q => ({
          name: `${q.completed ? '✅' : '📋'} ${q.name}`,
          value: `${q.description}\n**Progression :** ${Math.min(q.progress, q.max)}/${q.max} | **Récompense :** ${q.reward.toLocaleString()} coins${q.completed ? '\n*Complétée !*' : ''}`,
          inline: false,
        }))
      )
      .setFooter({ text: 'Verlaine Rôleplay • Quêtes' });

    message.reply({ embeds: [embed] });
  },
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEconomy, removeBalance, addBalance } = require('../../database/db');
const config = require('../../config');

const questions = [
  { q: 'Quelle est la capitale de la France ?', answers: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'], correct: 0 },
  { q: 'Combien y a-t-il de continents sur Terre ?', answers: ['5', '6', '7', '8'], correct: 2 },
  { q: 'Qui a peint la Joconde ?', answers: ['Picasso', 'Monet', 'Da Vinci', 'Raphaël'], correct: 2 },
  { q: 'Quelle planète est la plus grande du système solaire ?', answers: ['Saturne', 'Jupiter', 'Mars', 'Neptune'], correct: 1 },
  { q: 'Combien de côtés a un hexagone ?', answers: ['5', '6', '7', '8'], correct: 1 },
  { q: 'En quelle année a débuté la Première Guerre mondiale ?', answers: ['1912', '1914', '1916', '1918'], correct: 1 },
  { q: 'Quel est le plus grand océan du monde ?', answers: ['Atlantique', 'Indien', 'Arctique', 'Pacifique'], correct: 3 },
  { q: 'Quelle est la formule de l\'eau ?', answers: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1 },
  { q: 'Quel sport se joue avec une raquette et un volant ?', answers: ['Tennis', 'Squash', 'Badminton', 'Ping-pong'], correct: 2 },
  { q: 'Quelle est la monnaie du Japon ?', answers: ['Yuan', 'Won', 'Yen', 'Ringgit'], correct: 2 },
];

module.exports = {
  name: 'quiz',
  description: 'Participe à un quiz de 5 questions et gagne jusqu\'à x2 ta mise',
  usage: '-quiz <mise>',
  cooldown: 10,

  async execute(message, args) {
    const bet = parseInt(args[0]);
    if (!bet||bet<10) return message.reply('❌ Mise minimum : **10 coins**. Usage: `-quiz <mise>`');
    const eco = getEconomy(message.author.id);
    if (eco.balance<bet) return message.reply('❌ Solde insuffisant !');

    removeBalance(message.author.id, bet);

    const pool = [...questions].sort(() => Math.random()-0.5).slice(0,5);
    let score = 0, current = 0;

    const sendQuestion = async (msgRef) => {
      if (current >= pool.length) {
        const mult = 0.5 + (score / pool.length) * 1.5;
        const gain = Math.floor(bet * mult);
        addBalance(message.author.id, gain);
        const finalEmbed = new EmbedBuilder()
          .setColor(score >= 3 ? config.colors.success : config.colors.warning)
          .setTitle('📊 Quiz terminé !')
          .setDescription(
            `Score : **${score}/${pool.length}**\n\n` +
            `Multiplicateur : x${mult.toFixed(2)}\n` +
            `Gain : **${gain > bet ? '+' : ''}${(gain-bet).toLocaleString()} coins** (${gain.toLocaleString()} coins récupérés)`
          )
          .setFooter({ text: 'Verlaine Rôleplay • Quiz' });
        return msgRef.edit({ embeds: [finalEmbed], components: [] });
      }

      const q = pool[current];
      const btns = q.answers.map((a, i) =>
        new ButtonBuilder().setCustomId(`quiz_${i}`).setLabel(a).setStyle(ButtonStyle.Primary)
      );
      const row = new ActionRowBuilder().addComponents(btns);
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`❓ Question ${current+1}/5`)
        .setDescription(`**${q.q}**`)
        .setFooter({ text: `Score: ${score}/${current} | Mise: ${bet} coins` });

      if (msgRef) await msgRef.edit({ embeds: [embed], components: [row] });
      else return message.reply({ embeds: [embed], components: [row] });
      return msgRef;
    };

    let msgRef = await sendQuestion(null);

    const collector = msgRef.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 30000 });

    collector.on('collect', async i => {
      const q = pool[current];
      const chosen = parseInt(i.customId.split('_')[1]);
      const correct = chosen === q.correct;
      if (correct) score++;

      const feedback = new EmbedBuilder()
        .setColor(correct ? config.colors.success : config.colors.error)
        .setTitle(`${correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse !'}`)
        .setDescription(`Réponse correcte : **${q.answers[q.correct]}**`)
        .setFooter({ text: `Score: ${score}/${current+1}` });

      await i.update({ embeds: [feedback], components: [] });
      current++;
      setTimeout(() => sendQuestion(msgRef), 1500);
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        msgRef.edit({ embeds: [new EmbedBuilder().setColor(config.colors.error).setDescription('⏱️ Temps écoulé !')], components: [] }).catch(() => {});
      }
    });
  },
};

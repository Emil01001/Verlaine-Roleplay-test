const { EmbedBuilder } = require('discord.js');
const { getRpProfile, updateRpProfile } = require('../../database/db');
const config = require('../../config');

const actions = {
  manger: { emoji: '🍔', verb: 'mange', statKey: 'hunger', statChange: +30, cost: 20, desc: 'manger' },
  boire: { emoji: '💧', verb: 'boit', statKey: 'thirst', statChange: +30, cost: 10, desc: 'boire' },
  dormir: { emoji: '😴', verb: 'dort', statKey: 'health', statChange: +20, cost: 0, desc: 'dormir' },
  travailler_rp: { emoji: '💼', verb: 'travaille', statKey: 'money', statChange: +150, cost: 0, desc: 'travailler (RP)' },
  medecin: { emoji: '🏥', verb: 'va chez le médecin', statKey: 'health', statChange: +50, cost: 200, desc: 'aller chez le médecin' },
};

const makeCmd = (name, action) => ({
  name,
  description: `Action RP : ${action.desc}`,
  usage: `-${name}`,
  cooldown: 10,
  async execute(message) {
    const p = getRpProfile(message.author.id);
    if (action.cost > 0 && p.money < action.cost) {
      return message.reply(`❌ Il te faut **${action.cost} €** pour ${action.desc}.`);
    }

    const updates = {};
    if (action.statKey === 'money') {
      updates.money = (p.money || 0) + action.statChange;
    } else {
      updates[action.statKey] = Math.min(100, Math.max(0, (p[action.statKey] || 100) + action.statChange));
    }
    if (action.cost > 0) updates.money = (p.money || 0) - action.cost;

    updateRpProfile(message.author.id, updates);

    const embed = new EmbedBuilder()
      .setColor(config.colors.rp)
      .setDescription(
        `${action.emoji} **${message.author.username}** ${action.verb}.\n\n` +
        (action.statKey === 'money' ? `💰 **+${action.statChange} €** gagné !` : `📊 ${action.statKey}: **${Math.min(100, (p[action.statKey]||100)+action.statChange)}/100**`) +
        (action.cost > 0 ? `\n💸 Coût : **-${action.cost} €**` : '')
      )
      .setFooter({ text: 'Verlaine Rôleplay • RP' });
    message.reply({ embeds: [embed] });
  },
});

const allActions = Object.entries(actions).map(([name, action]) => makeCmd(name, action));
module.exports = allActions;

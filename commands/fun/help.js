const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

const categories = {
  economy: {
    emoji: '💰',
    name: 'Économie',
    commands: [
      '`-balance` — Voir son solde',
      '`-work` — Travailler (1h CD)',
      '`-daily` — Coins quotidiens',
      '`-slut` — Récompense vote',
      '`-rob <@user>` — Voler un joueur',
      '`-mine` — Miner des minerais',
      '`-bat [collect]` — Patrimoine immobilier',
      '`-buy <id>` — Boutique',
      '`-leaderboard` — Classement',
      '`-quete` — Voir les quêtes',
    ],
  },
  casino: {
    emoji: '🎰',
    name: 'Casino',
    commands: [
      '`-bj <mise>` — Blackjack',
      '`-slots <mise>` — Machine à sous',
      '`-roll <mise> <red/black/vert>` — Roulette',
      '`-crash <mise>` — Crash',
      '`-mines <mise> <bombes>` — Mines',
      '`-tower <mise>` — Tour',
      '`-pfc <@user> <mise>` — Pierre Feuille Ciseau',
      '`-gunfight <@user> <mise>` — Gunfight',
      '`-puissance4 <@user> <mise>` — Puissance 4',
      '`-poker <mise>` — Poker 3 cartes',
      '`-reddog <mise>` — Red Dog',
      '`-rouletterusse <mise>` — Roulette Russe',
      '`-quiz <mise>` — Quiz 5 questions',
      '`-pari <q>|<o1>|<o2>` — Pari custom',
      '`-course <mise> <durée>` — Course de chevaux',
      '`-scrabble <gain> <durée>` — Scrabble',
      '`-pot <goal> <durée> <bonus>` — Cagnotte',
      '`-bingo <gain> <durée>` — Bingo (Admin)',
      '`-drop <montant>` — Drop (Admin)',
    ],
  },
  rp: {
    emoji: '🗺️',
    name: 'Rôleplay',
    commands: [
      '`-profil [@user]` — Profil RP',
      '`-setprofil <champ> <val>` — Modifier profil',
      '`-concessionnaire` — Acheter des véhicules',
      '`-immobilier` — Acheter des propriétés',
      '`-metier [liste|prendre|salaire]` — Gérer métier',
      '`-crime [liste|n]` — Commettre un crime',
      '`-hopital [soigner]` — Se faire soigner',
      '`-rpmoney [@user]` — Voir son argent RP',
      '`-donnerrp <@user> <montant>` — Transférer argent RP',
      '`-banque [solde]` — Banque RP',
      '`-niveau [@user]` — Niveau et XP',
      '`-wanted [@user]` — Niveau wanted',
      '`-manger` — Se nourrir',
      '`-boire` — S\'hydrater',
      '`-dormir` — Se reposer',
    ],
  },
  staff: {
    emoji: '🛡️',
    name: 'Staff',
    commands: [
      '`-ban <@user> [raison]` — Bannir',
      '`-kick <@user> [raison]` — Expulser',
      '`-mute <@user> <durée> [raison]` — Muter',
      '`-unmute <@user>` — Démuter',
      '`-warn <@user> <raison>` — Avertir',
      '`-warns <@user>` — Voir les warns',
      '`-clear <1-100>` — Supprimer messages',
      '`-lock [#salon]` — Verrouiller salon',
      '`-slowmode <secs>` — Mode lent',
      '`-stafflogs [@staff]` — Logs staff',
      '`-staffinfo [@staff]` — Stats staff',
      '`-announce #salon <titre>|<msg>` — Annonce',
    ],
  },
  admin: {
    emoji: '⚙️',
    name: 'Admin',
    commands: [
      '`-setup <ticket|recrutement|notification>` — Configurer un système',
      '`-givecoins <@user> <±montant>` — Donner/retirer coins',
      '`-giverpmoney <@user> <montant>` — Argent RP admin',
    ],
  },
  fun: {
    emoji: '🎭',
    name: 'Utilitaires',
    commands: [
      '`-ping` — Latence du bot',
      '`-userinfo [@user]` — Info utilisateur',
      '`-serverinfo` — Info serveur',
      '`-avatar [@user]` — Voir avatar',
      '`-8ball <question>` — Boule magique',
      '`-wakeup <@user> <durée>` — Réveiller un membre',
    ],
  },
};

module.exports = {
  name: 'help',
  aliases: ['aide', 'h', 'commandes'],
  description: 'Voir toutes les commandes',
  usage: '-help [catégorie]',

  async execute(message, args) {
    const cat = args[0]?.toLowerCase();

    if (cat && categories[cat]) {
      const c = categories[cat];
      const embed = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`${c.emoji} Commandes — ${c.name}`)
        .setDescription(c.commands.join('\n'))
        .setFooter({ text: `Verlaine Rôleplay • Préfixe: ${config.prefix}`, iconURL: message.guild.iconURL({ dynamic: true }) });
      return message.reply({ embeds: [embed] });
    }

    const main = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('📚 Aide — Verlaine Rôleplay Bot')
      .setDescription(
        `Bienvenue dans l'aide du bot **Verlaine Rôleplay** !\n\n` +
        `**Préfixe :** \`${config.prefix}\`\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        Object.entries(categories).map(([k, v]) =>
          `${v.emoji} **${v.name}** — \`-help ${k}\` (${v.commands.length} commandes)`
        ).join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `**Total :** ${Object.values(categories).reduce((s,c)=>s+c.commands.length,0)} commandes disponibles`
      )
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • Bot ultra complet`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('Sélectionner une catégorie...')
        .addOptions(
          Object.entries(categories).map(([k, v]) => ({
            label: v.name,
            emoji: v.emoji,
            value: k,
            description: `${v.commands.length} commandes`,
          }))
        )
    );

    const msg = await message.reply({ embeds: [main], components: [row] });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 });
    collector.on('collect', async i => {
      const selected = categories[i.values[0]];
      if (!selected) return i.deferUpdate();
      const e = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`${selected.emoji} Commandes — ${selected.name}`)
        .setDescription(selected.commands.join('\n'))
        .setFooter({ text: `Verlaine Rôleplay • Préfixe: ${config.prefix}`, iconURL: message.guild.iconURL({ dynamic: true }) });
      await i.update({ embeds: [e], components: [row] });
    });
    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};

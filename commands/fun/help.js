const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

const categories = {
  economy: {
    emoji: '💰',
    name: 'Économie',
    commands: [
      '`-balance [@user]` — Voir son solde de coins',
      '`-work` — Travailler et gagner des coins *(CD: 1h)*',
      '`-daily` — Réclamer sa récompense quotidienne *(CD: 24h)*',
      '`-slut` — Récompense toutes les 12h',
      '`-rob <@user>` — Voler des coins à un joueur *(CD: 1h)*',
      '`-mine` — Miner des ressources et vendre des minerais *(CD: 30min)*',
      '`-buy <id>` — Acheter un item de la boutique',
      '`-bat [collect]` — Gérer son patrimoine / Collecter les revenus',
      '`-leaderboard [page]` — Classement des joueurs les plus riches',
      '`-quete` — Voir et compléter les quêtes journalières',
      '`-coinflip <pile/face> <mise>` — Lancer une pièce, double ou rien',
      '`-transfert <@user> <montant>` — Transférer des coins à quelqu\'un',
      '`-drop <montant>` — Drop public de coins à ramasser *(Admin)*',
      '`-pot <goal> <durée> <bonus>` — Créer une cagnotte commune',
    ],
  },
  casino: {
    emoji: '🎰',
    name: 'Casino',
    commands: [
      '`-bj <mise>` — Blackjack contre le dealer (21 ou moins)',
      '`-slots <mise>` — Machine à sous (3 symboles alignés)',
      '`-roll <mise> <rouge/noir/vert>` — Roulette colorée',
      '`-crash <mise>` — Crash — fais monter le multiplicateur et cash out!',
      '`-mines <mise> <bombes>` — Mines — ouvre des cases sans toucher les bombes',
      '`-tower <mise>` — Tour — grimpe les étages sans tomber',
      '`-gunfight <@user> <mise>` — Duel à mains armées contre un joueur',
      '`-puissance4 <@user> <mise>` — Puissance 4 interactif multijoueur',
      '`-poker <mise>` — Poker 3 cartes contre le dealer',
      '`-reddog <mise>` — Red Dog — ta carte est-elle entre les deux ?',
      '`-rouletterusse <mise>` — Roulette russe (1 chance sur 6)',
      '`-quiz <mise>` — Quiz 5 questions — réponds juste pour gagner',
      '`-course <mise> <durée>` — Course de chevaux — parie sur le bon cheval',
      '`-scrabble <gain> <durée>` — Scrabble — trouve le mot le premier',
      '`-bingo <gain> <durée>` — Bingo communautaire *(Admin)*',
      '`-bat <mise>` — Bat Royale — le survivant gagne la mise totale',
      '`-pari <question>|<option1>|<option2>` — Créer un pari personnalisé',
    ],
  },
  rp: {
    emoji: '🗺️',
    name: 'Rôleplay',
    commands: [
      '`-profil [@user]` — Voir le profil RP complet d\'un joueur',
      '`-setprofil <champ> <valeur>` — Modifier son profil RP (nom, age, desc...)',
      '`-concessionnaire` — Acheter des véhicules RP (voitures, motos...)',
      '`-immobilier` — Acheter des propriétés RP (appartement, maison...)',
      '`-metier [liste|prendre <n>|salaire]` — Gérer son emploi RP',
      '`-crime [liste|<n>]` — Commettre un crime RP (risque d\'être arrêté)',
      '`-hopital [soigner]` — Consulter ou se faire soigner à l\'hôpital',
      '`-rpmoney [@user]` — Voir son argent en jeu RP',
      '`-donnerrp <@user> <montant>` — Transférer de l\'argent RP à quelqu\'un',
      '`-banque [solde|depot <n>|retrait <n>]` — Gérer sa banque RP',
      '`-niveau [@user]` — Voir son niveau, XP et progression',
      '`-wanted [@user]` — Voir le niveau wanted (recherché par la police)',
      '`-manger` — Manger pour récupérer de l\'énergie *(CD: 30min)*',
      '`-boire` — Boire pour s\'hydrater *(CD: 15min)*',
      '`-dormir` — Se reposer pour régénérer de l\'énergie *(CD: 8h)*',
      '`-fugitif <@user>` — Mettre quelqu\'un en mode fugitif',
      '`-decrire <texte>` — Se décrire en RP',
      '`-wakeup <@user> <durée>` — Réveiller un joueur actuellement KO',
      '`-rpactions` — Voir la liste des actions RP disponibles',
    ],
  },
  staff: {
    emoji: '🛡️',
    name: 'Staff',
    commands: [
      '`-ban <@user> [raison]` — Bannir définitivement un membre',
      '`-kick <@user> [raison]` — Expulser un membre du serveur',
      '`-mute <@user> <durée> [raison]` — Timeout *(ex: 5m, 1h, 1d)*',
      '`-unmute <@user> [raison]` — Retirer le timeout d\'un membre',
      '`-warn <@user> <raison>` — Avertir officiellement un membre',
      '`-warns <@user>` — Voir l\'historique des avertissements',
      '`-clear <1-100>` — Supprimer en masse des messages',
      '`-lock [#salon]` — Verrouiller un salon (empêche d\'écrire)',
      '`-slowmode <secondes>` — Activer/modifier le mode lent',
      '`-announce #salon <titre>|<message>` — Faire une annonce officielle',
      '`-stafflogs [@staff]` — Consulter les logs d\'action d\'un staff',
      '`-staffinfo [@staff]` — Voir les statistiques de modération d\'un staff',
    ],
  },
  admin: {
    emoji: '⚙️',
    name: 'Administration',
    commands: [
      '`-setup ticket` — Configurer et poster le panneau de tickets',
      '`-setup recrutement` — Configurer le salon recrutement',
      '`-setup notification` — Configurer le panneau de notifications',
      '`-givecoins <@user> <±montant>` — Ajouter ou retirer des coins',
      '`-giverpmoney <@user> <montant>` — Modifier l\'argent RP d\'un joueur',
    ],
  },
  fun: {
    emoji: '🎭',
    name: 'Utilitaires',
    commands: [
      '`-ping` — Voir la latence du bot et de l\'API Discord',
      '`-userinfo [@user]` — Voir les informations détaillées d\'un membre',
      '`-serverinfo` — Voir les statistiques du serveur',
      '`-avatar [@user]` — Afficher l\'avatar en haute résolution',
      '`-8ball <question>` — Poser une question à la boule magique',
      '`-transfert <@user> <montant>` — Donner des coins à un autre joueur',
    ],
  },
  systemes: {
    emoji: '🔧',
    name: 'Systèmes',
    commands: [
      '🎫 **Tickets** — Ouvrir un ticket support via le salon dédié',
      '📋 **Recrutement** — Candidater au staff via le salon dédié',
      '🔔 **Notifications** — Gérer ses rôles notifs via le salon dédié',
      '👋 **Bienvenue** — Message automatique à chaque nouveau membre',
      '🚀 **Boosts** — Annonce et récompense automatique des boosts',
      '⭐ **Évaluations** — Note ton expérience après fermeture d\'un ticket',
      '📊 **Cases** — Chaque sanction est numérotée et archivée en DB',
      '📝 **Logs Staff** — Traçabilité complète des actions de modération',
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

    const totalCmds = Object.values(categories).reduce((s, c) => s + c.commands.length, 0);

    const main = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('📚 Aide — Verlaine Rôleplay Bot')
      .setDescription(
        `Bienvenue dans l'aide du bot **Verlaine Rôleplay** !\n\n` +
        `**Préfixe :** \`${config.prefix}\`\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        Object.entries(categories).map(([k, v]) =>
          `${v.emoji} **${v.name}** — \`-help ${k}\` *(${v.commands.length} entrées)*`
        ).join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `**Total :** ${totalCmds} commandes & systèmes`
      )
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Verlaine Rôleplay • Bot ultra complet`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('📂 Sélectionner une catégorie...')
        .addOptions(
          Object.entries(categories).map(([k, v]) => ({
            label: v.name,
            emoji: v.emoji,
            value: k,
            description: `${v.commands.length} entrées`,
          }))
        )
    );

    const msg = await message.reply({ embeds: [main], components: [row] });

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 120000,
    });

    collector.on('collect', async i => {
      const selected = categories[i.values[0]];
      if (!selected) return i.deferUpdate();
      const e = new EmbedBuilder()
        .setColor(config.colors.info)
        .setTitle(`${selected.emoji} Commandes — ${selected.name}`)
        .setDescription(selected.commands.join('\n'))
        .setFooter({ text: `Verlaine Rôleplay • Préfixe: ${config.prefix} | Sélectionnez une autre catégorie`, iconURL: message.guild.iconURL({ dynamic: true }) });
      await i.update({ embeds: [e], components: [row] });
    });

    collector.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};

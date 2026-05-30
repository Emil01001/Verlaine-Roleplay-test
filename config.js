require('dotenv').config();

module.exports = {
  token: process.env.TOKEN,
  prefix: '-',
  guildId: '1504935574669365463',

  channels: {
    announce: '1504949036086591518',
    reglement: '1504938519292940370',
    informations: '1504945370436997352',
    notifRole: '1505005185246957750',
  },

  roles: {
    notifAnnonce: '1505008449140817950',
    notifReseaux: '1505008986359992371',
    notifSondage: '1505008512877596932',
    notifEvenementiel: '1505009046212706344',
    notifSpoils: '1505228299872243905',
    notifUpdate: '1505231514600738826',
    notifJournal: '1505255201467269321',
  },

  colors: {
    primary: 0x2B2D31,
    success: 0x57F287,
    error: 0xED4245,
    warning: 0xFEE75C,
    info: 0x5865F2,
    boost: 0xFF73FA,
    economy: 0xF1C40F,
    rp: 0x3498DB,
    staff: 0xE74C3C,
  },

  economy: {
    workMin: 50,
    workMax: 300,
    workCooldown: 3600000,
    dailyMin: 500,
    dailyMax: 1000,
    dailyCooldown: 86400000,
    slutCooldown: 43200000,
    robChance: 0.45,
    robCooldown: 3600000,
  },

  ticketCategories: [
    {
      label: 'Partenariat développement',
      emoji: '<:partenariat:1505190484992069682>',
      value: 'partenariat',
      description: 'Proposer un partenariat ou développement',
      color: 0x57F287,
    },
    {
      label: 'Administration',
      emoji: '<:bolt:1507535173854695465>',
      value: 'administration',
      description: 'Contacter l\'administration',
      color: 0xED4245,
    },
    {
      label: 'Ticket Autres',
      emoji: '<:recherche:1507535218301603960>',
      value: 'autres',
      description: 'Autre demande',
      color: 0x5865F2,
    },
  ],

  recruitmentCategories: [
    {
      label: 'Modérateur',
      emoji: '🔨',
      value: 'moderateur',
      description: 'Candidater en tant que Modérateur',
      questions: [
        'Quel est ton pseudo en jeu ?',
        'Quel est ton âge ?',
        'Quelle est ton expérience en modération ?',
        'Pourquoi veux-tu rejoindre l\'équipe de modération ?',
        'Combien d\'heures par semaine peux-tu dédier au serveur ?',
      ],
    },
    {
      label: 'Développeur',
      emoji: '💻',
      value: 'developpeur',
      description: 'Candidater en tant que Développeur',
      questions: [
        'Quel est ton pseudo en jeu ?',
        'Quel est ton âge ?',
        'Quels langages de programmation maîtrises-tu ?',
        'Montre-nous un projet que tu as réalisé (lien ou description)',
        'Quelle est ta motivation pour rejoindre l\'équipe dev ?',
      ],
    },
    {
      label: 'Communication',
      emoji: '📢',
      value: 'communication',
      description: 'Candidater en tant que membre Communication',
      questions: [
        'Quel est ton pseudo en jeu ?',
        'Quel est ton âge ?',
        'Quelle est ton expérience en communication / réseaux sociaux ?',
        'Quelles sont tes idées pour le serveur ?',
        'Quelle est ta motivation à rejoindre l\'équipe communication ?',
      ],
    },
  ],
};

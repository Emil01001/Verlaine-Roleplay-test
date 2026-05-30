const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} est en ligne !`);
    console.log(`📊 Serveurs: ${client.guilds.cache.size} | Utilisateurs: ${client.users.cache.size}`);

    const activities = [
      { name: 'Verlaine Rôleplay 🗼', type: ActivityType.Watching },
      { name: '-help | VRP', type: ActivityType.Playing },
      { name: 'le serveur', type: ActivityType.Watching },
    ];

    let i = 0;
    client.user.setPresence({ activities: [activities[0]], status: 'online' });

    setInterval(() => {
      i = (i + 1) % activities.length;
      client.user.setPresence({ activities: [activities[i]], status: 'online' });
    }, 30000);
  },
};

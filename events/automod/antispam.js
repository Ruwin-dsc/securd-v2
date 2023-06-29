const map = new Map();

module.exports = {
  name: "messageCreate",

  async run(client, message) {
    if (message.author.id === client.user.id) return;
    const channel = message.channel;
    if (!channel || !channel.guild) return;
    const guildManager = client.managers.guildManager.getOrCreate(message.guild?.id);
    const config = guildManager.get("automod")?.antispam;
    if (!config || !config?.toggle) return;
    let userdata = map.get(message.author.id) || 0;
    let bypass = false;
    if (message.author.id === client.user.id) return;
    if (message.author.id === message.guild.ownerId) bypass = true;
    if ((guildManager.get("crowns") || []).includes(message.author.id)) bypass = true;
    if (bypass) return;
    map.set(message.author.id, userdata + 1);
    if (userdata >= 3) {
      config.actions?.forEach(action => {
        if (action === "reply") message.channel.send(`${message.author}, you are sending too many messages, please slow down.`).then((m) => setTimeout(() => m.delete(), 5000));
        if (action === "delete") {
          channel.messages.fetch({ limit: 80 }).then((messages) => {
            const filtered = messages.filter(m => m.author.id === message.author.id);
            channel.bulkDelete(filtered).catch(() => { });
          }).catch(() => { })
        }
        if (action === "mute") {
          const role = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("muet") || r.name.toLowerCase().includes("mute"));
          if (!role) return;
          message.member.roles.add(role).catch(() => { });
        }
      })
    }

    setTimeout(() => {
      map.delete(message.author.id);
    }, 2500)

  }
}
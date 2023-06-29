const Securd = require("../../structures/Securd");

module.exports = {
  name: "MESSAGE_CREATE",
  /**
   * @param {Securd} client
   */
  async run(client, data) {
    const channel = client.channels.cache.get(data.channel_id);
    if (!channel || !channel.guild) return;
    const guild = channel.guild;
    const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
    const config = guildManager.get("automod")?.antilink;
    if (!config || !config?.toggle) return;
    const message = await channel.messages.fetch(data.id);
    let discordInvite = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
    let reg = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    if (!discordInvite.test(message.content) && !reg.test(message.content)) return;
    const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("links"));
    let bypass = false;
    if (message.author.id === client.user.id) return;
    if (message.author.id === guild.ownerId) bypass = true;
    if ((guildManager.get("crowns") || []).includes(message.author.id)) bypass = true;
    for await (const itemPermissions of allItemPermissions.values()) {
      if (itemPermissions.itemId === message.author.id || message.member.roles.cache.has(itemPermissions.itemId)) {
        bypass = true;
        break;
      }
    }
    if (bypass) return;
    config.actions?.forEach((action) => {
      if (action === "delete") message.delete().catch(() => { });
      if (action === "reply") message.channel.send(`${message.author}, you are not allowed to send links in this server!`).then((m) => setTimeout(() => m.delete(), 2000)).catch(() => { });
      if (action === "mute") {
        const muteRole = guild.roles.cache.find((r) => r.name.toLowerCase().includes("muet") || r.name.toLowerCase().includes("mute"));
        if (!muteRole) return client.util.antiraidLog(guild, `${message.author} tried to send a link but the mute role was not found!`);
        message.member.roles.add(muteRole).catch(() => { });
      }
    })
  }
}
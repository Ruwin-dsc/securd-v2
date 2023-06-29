module.exports = {
    name: "messageCreate",
    /**
     * @param {Securd} client
     */
    async run(client, oldMessage, newMessage) {
        const guild = oldMessage.guild;
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
        const config = guildManager.get("automod")?.antilink;
        if (!config || !config?.toggle) return;
        let discordInvite = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;
        let reg = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        if (!discordInvite.test(oldMessage.content) && !reg.test(oldMessage.content)) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("links"));
        let bypass = false;
        if (oldMessage.author.id === client.user.id) return;
        if (oldMessage.author.id === guild.ownerId) bypass = true;
        if ((guildManager.get("crowns") || []).includes(oldMessage.author.id)) bypass = true;
        for await (const itemPermissions of allItemPermissions.values()) {
            if (itemPermissions.itemId === oldMessage.author.id || oldMessage.member.roles.cache.has(itemPermissions.itemId)) {
                bypass = true;
                break;
            }
        }
        if (bypass) return;
        config.actions?.forEach((action) => {
            if (action === "delete") oldMessage.delete().catch(() => { });
            if (action === "reply") oldMessage.channel.send(`${oldMessage.author}, you are not allowed to send links in this server!`).then((m) => setTimeout(() => m.delete(), 2000)).catch(() => { });
            if (action === "mute") {
                const muteRole = guild.roles.cache.find((r) => r.name.toLowerCase().includes("muet") || r.name.toLowerCase().includes("mute"));
                if (!muteRole) return client.util.antiraidLog(guild, `${oldMessage.author} tried to send a link but the mute role was not found!`);
                oldMessageoldMessage.member.roles.add(muteRole).catch(() => { });
            }
        })
    }
}
const Securd = require("../../structures/Securd");

module.exports = {
    name: "GUILD_MEMBER_ADD",

    /**
     * @param {Securd} client
     */

    async run(client, data) {
        if (!data.user.bot) return;
        const guild = client.guilds.cache.get(data.guild_id);
        const member = guild.members.cache.get(data.user.id);
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id)
        const config = guildManager.get("antiraid")?.bots.add;
        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("addBots"));
        let bypass = false;

        const log = (await guild.fetchAuditLogs({ type: 28, limit: 1 })).entries.first();
        const executor = log.executor;
        const executorMember = await guild.members.fetch(executor.id);
        if (executor.id === client.user.id) return;
        if (executor.id === guild.ownerId) bypass = true;
        if ((guildManager.get("crowns") || []).includes(executor.id)) bypass = true;
        for await (const itemPermissions of allItemPermissions.values()) {
            if (itemPermissions.itemId === executor.id || executorMember.roles.cache.has(itemPermissions.itemId)) {
                bypass = true;
                break;
            }
        }
        member.kick("Securd - Anti-BotAdd").catch(() => { });
        if (bypass) return;
        client.util.punish(guild, executorMember, config.punish, "Securd - Anti-BotAdd", "Failed to punish the user for adding a bot", "Successfully punished the user for adding a bot")
    }
}
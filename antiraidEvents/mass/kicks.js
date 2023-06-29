const map = new Map()


const Securd = require("../../structures/Securd"),
    { GuildBan } = require("discord.js"),
    ms = require("ms")

module.exports = {
    name: "GUILD_AUDIT_LOG_ENTRY_CREATE",

    /**
     * @param {Securd} client
     * @param {GuildBan} kick
     */

    async run(client, kick) {
        if (kick.action_type !== 20) return;
        const guild = client.guilds.cache.get(kick.guild_id);

        const log = (await guild.fetchAuditLogs({ type: 20, limit: 1 })).entries.first();
        if (!log) return;
        const executor = log.executor;
        if (executor.id === client.user.id) return;
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
        const config = guildManager.get("antiraid")?.mass.kicks;

        if (!config || !config?.toggle) return;
        const number = config.limit.split("/")[0];
        const time = config.limit.split("/")[1];
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("kickMembers"));
        let bypass = false;

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
        if (bypass) return;
        const data = map.get(`${guild.id}-${executor.id}`) || 0
        if (data + 1 >= number) {
            client.util.punish(guild, executorMember, config.punish, "Securd - Anti-MassKick", "Failed to punish the user for kicking multiple users", "Successfully punished the user for kicking multiple users")
            map.delete(`${guild.id}-${executor.id}`)
        } else {
            map.set(`${guild.id}-${executor.id}`, data + 1)
        }
        if (data === 0) {
            setTimeout(() => {
                map.delete(`${guild.id}-${executor.id}`)
            }, ms("1" + time))
        }
    }
}
const { Role } = require("discord.js"),
    Securd = require("../../structures/Securd");

module.exports = {
    name: "GUILD_ROLE_DELETE",

    /**
     * @param {Securd} client
     * @param {Role} role
     */

    async run(client, role) {
        const guild = client.guilds.cache.get(role.guild_id);
        const log = (await guild.fetchAuditLogs({ type: 32, limit: 1 })).entries.first();
        if (!log) return;
        const executor = log.executor;
        if (executor.id === client.user.id) return;
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
        const config = guildManager.get("antiraid")?.roles.delete;

        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("rolesDelete"));
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
        guild.roles.create({
            ...role.role,
            reason: "Securd - Anti-RoleDelete"
        }).catch(e => { });

        client.util.punish(guild, executorMember, config.punish, "Securd - Anti-RoleDelete", "Failed to punish the user for deleting a role", "Successfully punished the user for deleting a role")
    }
}
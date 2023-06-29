const { Role } = require("discord.js"),
    Securd = require("../../structures/Securd");

module.exports = {
    name: "GUILD_ROLE_UPDATE",

    /**
     * @param {Securd} client
     * @param {Role} role
     */

    async run(client, role) {
        const guild = client.guilds.cache.get(role.guild_id);
        const log = (await guild.fetchAuditLogs({ type: 31, limit: 1 })).entries.first();
        if (!log) return;
        const executor = log.executor;
        if (executor.id === client.user.id) return;
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
        const config = guildManager.get("antiraid")?.roles.update;

        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("rolesUpdate"));
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
        guild.roles.edit(role.role.id, {
            ...role.role,
            reason: "Securd - Anti-RoleUpdate"
        })

        client.util.punish(guild, executorMember, config.punish, "Securd - Anti-RoleUpdate", "Failed to punish the user for updating a role", "Successfully punished the user for updating a role")
    }
}
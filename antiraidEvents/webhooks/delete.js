const Securd = require("../../structures/Securd"),
    { Channel } = require("discord.js");



module.exports = {
    name: "GUILD_AUDIT_LOG_ENTRY_CREATE",
    /**
     * @param {Securd} client
     * @param {Channel} webhook
     */
    async run(client, webhook) {
        if (webhook.action_type !== 51) return;
        const guild = client.guilds.cache.get(webhook.guild_id)
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id)
        const config = guildManager.get("antiraid")?.webhooks.delete;
        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("deleteWebhooks"));
        let bypass = false;
        const log = (await guild.fetchAuditLogs({ type: 51, limit: 1 })).entries.first();
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
        if (bypass) return;
        (await guild.channels.fetch(webhook.target_id)).createWebhook({ name: webhook.changes[0].old_value.name, avatar: webhook.changes[0].old_value.avatar })
        client.util.punish(guild, executorMember, config.punish, "Securd - Anti-WebhookDelete", "Failed to punish the user for deleting a webhook", "Successfully punished the user for deleting a webhook")
    }
}
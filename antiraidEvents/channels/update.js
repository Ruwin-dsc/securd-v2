const { Channel } = require("discord.js"),
    Securd = require("../../structures/Securd");

module.exports = {
    name: "CHANNEL_UPDATE",

    /**
     * @param {Securd} client
     * @param {Channel} channel
     */

    async run(client, channel) {// en 2m j'ai compris tout le script
        const guild = client.guilds.cache.get(channel.guild_id);

        const log = (await guild.fetchAuditLogs({ type: 11, limit: 1 })).entries.first();
        if (!log) return;
        const executor = log.executor;
        if (executor.id === client.user.id) return;
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
        const config = guildManager.get("antiraid")?.channels.update;

        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("channelsUpdate"));
        let bypass = false;



        const executorMember = await guild.members.fetch(executor.id);
        if (executor.id === client.user.id) return;
        if (executor.id === guild.ownerId) bypass = true;
        if ((guildManager.get("crowns") || []).includes(executor.id)) bypass = true;
        for await (const itemPermissions of allItemPermissions.values()) {
            if (itemPermissions.itemId === executor.id || executorMember.channels.cache.has(itemPermissions.itemId)) {

                bypass = true;
                break;
            }
        }
        if (bypass) return;
        let parent_id = channel.parent_id;

        guild.channels.edit(channel.id, {
            ...channel,
            reason: "Securd - Anti-ChannelUpdate"
        })

        client.util.punish(guild, executorMember, config.punish, "Securd - Anti-ChannelUpdate", "Failed to punish the user for updating a channel", "Successfully punished the user for updating a channel")
    }
}
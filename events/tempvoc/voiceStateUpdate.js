const map = new Map();

module.exports = {
    name: "voiceStateUpdate",

    async run(client, oldState, newState) {
        const guildData = client.managers.guildManager.getOrCreate(oldState.guild.id);
        const config = guildData.get("tempvoc")  || {
            prefix: "⏲️-",
            channel: "",
            toggle: false,
        }
        if (!config.toggle) return;


        if (!oldState.channelId && newState.channelId) {
            if (newState.channelId !== config.channel) return;
            const channel = newState.guild.channels.cache.get(newState.channelId);
            const member = newState.guild.members.cache.get(newState.id)
            newState.guild.channels.create({
                name: config.prefix + ` ${member.user.username}`,
                parent: channel.parentId,
                type: 2,
            }).then((voc) => {
                newState.setChannel(voc)
                map.set(voc.id, member.user.id);
            })
        } else if (oldState.channelId && !newState.channelId) {
            if (map.has(oldState.channelId)) {
                const channel = oldState.guild.channels.cache.get(oldState.channelId);
                if (channel.members.size === 0) {
                    channel.delete();
                    map.delete(oldState.channelId)
                }
            }
        }
    }
}
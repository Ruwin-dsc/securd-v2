module.exports = {
    name: 'ready',

    async run(client) {
        await client.util.sleep(3000);
        setInterval(() => {
            client.managers.guildManager.forEach((manager) => {
                const guild = client.guilds.cache.get(manager.get("id"));
                if (!guild) return;
                const counters = manager.get("counters");
                for (const key of Object.keys(counters).filter((k => counters[k].channel))) {
                    const counter = counters[key];
                    let count;
                    if (key === "members") count = guild.memberCount;
                    if (key === "bots") count = guild.members.cache.filter(member => member.user.bot).size;
                    if (key === "boosts") count = guild.premiumSubscriptionCount;
                    if (key === "voice") count = guild.members.cache.filter(member => member.voice.channel).size;
                    const channel = guild.channels.cache.get(counter.channel);
                    if (!channel) return;
                    if (channel.name !== `${counter.name.replace("{count}", count.toString())}`) channel.setName(`${counter.name.replace("{count}", count.toString())}`);
                }
            })
        }, 120000)
    }
}
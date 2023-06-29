module.exports = {
    name: "guildMemberAdd",

    async run(client, member) {
        const guildData = client.managers.guildManager.getOrCreate(member.guild.id);
        let test = guildData.get("ghostpings") || []
            for (const channelId of test) {
            const channel = member.guild.channels.cache.get(channelId)
            channel?.send(`${member}`).then((m) => m.delete()).catch(e => { })
        }
    }
}
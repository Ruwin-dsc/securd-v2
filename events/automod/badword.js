module.exports = {
    name: "messageCreate",

    async run(client, message) {
        const guildData = client.managers.guildManager.getOrCreate(message.guild.id);
        const badwordsConfig = guildData.get("badwordsConfig")
        if (badwordsConfig?.words?.length === 0) return;
        const content = message.content.trim().split(" ");
        let bypass = false
        if (message.author.id === client.user.id) return;
        if (message.author.id === message.guild.ownerId) bypass = true;
        if ((guildData.get("crowns") || []).includes(message.author.id)) bypass = true;
        if (bypass) return;

        if (content.some((word) => badwordsConfig?.words?.includes(word.toLowerCase()))) {
            message.delete().catch((e) => { });
            message.channel.send(`${message.author}, please use appropriate words`).then(async (m) => {
                await client.util.sleep(3000)
                m.delete()
            })
        }
    }

}
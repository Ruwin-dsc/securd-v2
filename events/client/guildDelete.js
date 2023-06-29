module.exports = {
    name: "guildDelete",

    async run(client, guild) {
        if(guild.name == undefined) return
        let embed = {
            title: `${guild.name}`,
            description: ` \`${guild.name}\` has just expelled me, I am now on ${client.guilds.cache.size} servers`,
            color: process.env.COLOR,
            fields: [
                { name: 'ID', value: `${guild.id}` },
                { name: 'Members', value: `${guild.memberCount} | ${guild.members.cache.filter((m) => m.user.bot).size} bots`, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}> ( ${guild.ownerId})`, inline: true },],
            footer: { iconURL: client.user.avatarURL(), text: "Securd - Your Security, Our Priority" }
        }
        client.guilds.cache.get("1099041324554014740").channels.cache.get("1102358290895224902").send({ embeds: [embed] })
    }
}
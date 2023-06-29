module.exports = {
    name: "guildCreate",

    async run(client, guild) {
        console.log(` + ${guild.name} ( ${guild.memberCount} members ) - ${client.guilds.cache.size} servers`)
        let embed = {
            title: `${guild.name}`,
            color: process.env.COLOR,
            description: ` \`${guild.name}\` just added me, I am now on ${client.guilds.cache.size} servers`,
            fields: [
                { name: 'ID', value: `${guild.id}` },
                { name: 'Members', value: `${guild.memberCount} | ${guild.members.cache.filter((m) => m.user.bot).size} bots`, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}> ( ${guild.ownerId})`, inline: true },],
            footer: { iconURL: client.user.avatarURL(), text: "Securd - Your Security, Our Priority" }
        }
       client.guilds.cache.get("1099041324554014740").channels.cache.get("1102358290895224902").send({ embeds: [embed] })
       
    }
}
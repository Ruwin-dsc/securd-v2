module.exports = {
    name: "presenceUpdate",

    async run(client, oldPresence, newPresence) {
    /*    //if(newPresence.activities[0]?.type !== 4) return;
        const guild = newPresence.guild;
        const guildData = client.managers.guildManager.getOrCreate(guild.id);
        let { message, role, toggle } = guildData.get("soutien");
        if (!toggle) return;
        const member = guild.members.cache.get(newPresence.userId);
        if (!member) return;
        const args = newPresence.activities[0]?.state?.toLowerCase().split(" ");

        if (args?.find((v) => v.includes(message?.toLowerCase()))) {
            member.roles.add(role).catch(e => { })
        } else if (member.roles.cache.has(role)) {
            member.roles.remove(role).catch((e) => { })
        }
    */}
    
} 
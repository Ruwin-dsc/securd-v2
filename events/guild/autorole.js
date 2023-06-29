const Canvas = require("canvas");

module.exports = {
    name: "guildMemberAdd",

    async run(client, member) {

        const guildManager = client.managers.guildManager.getOrCreate(member.guild.id);
        const config = guildManager.get("autorole") || { roles: undefined, toggle: undefined }
        if (!config.toggle) return;

        member.roles.add(config.roles);

    }
}
const Securd = require("../../structures/Securd");
const Discord = require('discord.js')
module.exports = {
    name: "ready",

    /**
     * @param {Securd} client
    */

    async run(client) {
        console.log(`Securd Bot is ready! Logged in as ${client.user.tag}!`)
        client.application.commands.set(client.commands.toJSON())
        process.env.COLOR = require("discord.js").resolveColor("#2f3136");
         client.user.setPresence({
  activities: [{ name: `vos serveurs ⚒️`, type: Discord.ActivityType.Watching }],
  status: 'dnd',
});
    }

}

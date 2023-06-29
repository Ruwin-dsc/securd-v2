const { CommandInteraction } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "about",
    description: "About the bot",

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const djs = require("discord.js").version;
        const node = process.version;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) + 597851
        let embed = {
            title: `About Securd`,
            fields: [
                { name: `${client.botemojis.owner} Owners`, value: `<@350005907284819968> `, inline: true },
                { name: `${client.botemojis.djs} Discord.js`, value: `\`${djs}\``, inline: true },
                { name: `${client.botemojis.node} Node.js`, value: `\`${node}\``, inline: true },
                { name: `${client.botemojis.stats} Servers`, value: `\`${client.guilds.cache.size}\``, inline: true },
                { name: `${client.botemojis.user} Users`, value: `\`${users}\``, inline: true },
                { name: `${client.botemojis.ping} Ping`, value: `\`${client.ws.ping}ms\``, inline: true },
                { name: `${client.botemojis.support} Support`, value: `[Click here](https://discord.gg/securd)`, inline: true },
            ],
            color: process.env.COLOR,
            url: "https://discord.gg/securd",
            image: {
                url: "https://media.discordapp.net/attachments/1095435118472073236/1095735738559102996/On1.jpg?width=1440&height=142"
            },
            footer: { iconURL: client.user.avatarURL(), text: "Securd - Your Security, Our Priority" }
        }
        interaction.reply({ embeds: [embed], content: "https://discord.gg/securd", ephemeral: false })

    }
}
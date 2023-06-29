const { CommandInteraction, chatInputApplicationCommandMention } = require("discord.js"),
    Securd = require("../../structures/Securd");

module.exports = {
    name: "help",
    description: "This is the help command",
    options: [
        { name: "command", description: "Information about an command", type: 3 },
    ],

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const cmdstr = interaction.options
            .getString("command")
            ?.trim()
            ?.toLowerCase();
        if (cmdstr) {
            const command =
                client.commands.get(cmdstr) ||
                client.commands.find((cmd) => cmd.name.includes(cmdstr));
            if (!command)
                return interaction.reply({
                    content: `No command found for \`${cmdstr}\``,
                });
            const embed = {
                title: `Command ${command.name}`,
                fields: [
                    { name: `Name:`, value: `> \`${command.name}\`` },
                    {
                        name: `About:`,
                        value: `> \`${command.description}\``,
                    },
                ],
                footer: { text: "Securd - Your Security", icon_ur: client.user.displayAvatarURL() },
                color: process.env.COLOR,
                image: {
                    url: "https://media.discordapp.net/attachments/1079783951083769892/1079786057878474772/image_2023-01-26_205852116.jpg"
                }
            };
            interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            const commands = await client.application.commands.fetch();
            function findByName(name) {
                return commands.find(command => command.name === name)
            }

            let embeds = [
                {
                    title: "Help - Commands",
                    description: `» Securd is a bot for your Security, he have many features to help you with your server management and protect your server from bad people.`,
                    fields: [
                        { name: "<:owner:1078357520185311342> Admin", value: `${chatInputApplicationCommandMention("antiraid", findByName("antiraid").id)}, ${chatInputApplicationCommandMention("automod", findByName("automod").id)}, ${chatInputApplicationCommandMention("captcha", findByName("captcha").id)}, ${chatInputApplicationCommandMention("autorole", findByName("autorole").id)}, ${chatInputApplicationCommandMention("permissions", findByName("permissions").id)}, ${chatInputApplicationCommandMention("crown", findByName("crown").id)}, ${chatInputApplicationCommandMention("badword", findByName("badword").id)}, ${chatInputApplicationCommandMention("tempvoc", findByName("tempvoc").id)}, ${chatInputApplicationCommandMention("ghostpings", findByName("ghostpings").id)}, ${chatInputApplicationCommandMention("counter", findByName("counter").id)}, ${chatInputApplicationCommandMention("soutien config", findByName("soutien").id)}, ${chatInputApplicationCommandMention("soutien list", findByName("soutien").id)}` },
                        { name: "<:settings:1078445275951145082> Moderation", value: `${chatInputApplicationCommandMention("ban", findByName("ban").id)}, ${chatInputApplicationCommandMention("kick", findByName("kick").id)}, ${chatInputApplicationCommandMention("lock", findByName("lock").id)}, ${chatInputApplicationCommandMention("unlock", findByName("unlock").id)}, ${chatInputApplicationCommandMention("clear", findByName("clear").id)},  ${chatInputApplicationCommandMention("ticket panel create", findByName("ticket").id)}, ${chatInputApplicationCommandMention("ticket panel delete", findByName("ticket").id)}, ${chatInputApplicationCommandMention("ticket list", findByName("ticket").id)}` },
                        { name: "<:user:1078354079618695188> Other", value: `${chatInputApplicationCommandMention("help", findByName("help").id)}, ${chatInputApplicationCommandMention("banner", findByName("banner").id)}, ${chatInputApplicationCommandMention("about", findByName("about").id)}` },
                    ],
                    color: process.env.COLOR,
                    footer: { text: "Securd - Your Security", icon_ur: client.user.displayAvatarURL() },
                    image: {
                        url: "https://media.discordapp.net/attachments/1095435118472073236/1095735738559102996/On1.jpg?width=1440&height=142"
                    }
                },
                {
                    title: "Help - Securd",
                    description: `Securd is a bot for your Security, he have many features to help you with your server management and protect your server from bad people.\n
                Securd have the best protection system optimized for your server, you can give permissions to a role or a member, and then he can bypass the protection system.\n
                For example, you can give the permission "Crown" to a member, and then he can bypass the protection system, and he can manage permissions for the server, except the role or member that he can manage.
                \nThank you for using Securd!`,
                    color: process.env.COLOR,
                    image: {
                        url: "https://media.discordapp.net/attachments/1070003848103612556/1080191951124570212/image_2023-01-26_205852116.jpg"
                    }
                }
            ]
            client.util.embedPage(interaction, embeds, false)
        }
    }
}
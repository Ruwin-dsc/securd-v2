const { CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "automod",
    description: "Configure the automod system",

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const guildManager = client.managers.guildManager.getOrCreate(interaction.guild.id);
        const config = guildManager.get("automod") || { antilink: { toggle: false, actions: [] }, antispam: { toggle: false, actions: [] }, }
        if (
            interaction.user.id !== interaction.guild.ownerId &&
            !(guildManager.get("crowns") || []).includes(interaction.user.id)
        )
            return interaction.reply({
                content: `${client.botemojis.no} | You don't have permission to use this command`,
                ephemeral: true,
            });

        config.antilink ? null : config.antilink = { toggle: false, actions: [] }
        config.antispam ? null : config.antispam = { toggle: false, actions: [] }
        chooseaOption()
        async function chooseaOption() {
            let embed = {
                title: "Automod",
                description: "Choose an option",
                color: process.env.COLOR,
                footer: { text: "Securd - Your Security", icon_url: client.user.displayAvatarURL() },
            }
            let menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder({ customId: "automod", placeholder: "Securd" })
                    .addOptions(
                        {
                            label: "Anti-Spam",
                            description: "Configure the anti-spam system",
                            value: "antispam",
                            emoji: { id: client.util.getEmojiId(config.antispam?.toggle ? client.botemojis.yes : client.botemojis.no) }
                        },
                        {
                            label: "Anti-Link",
                            description: "Configure the anti-link system",
                            value: "antilink",
                            emoji: { id: client.util.getEmojiId(config.antilink?.toggle ? client.botemojis.yes : client.botemojis.no) }
                        },
                    )
            )
            const message = await (interaction.replied ? interaction.editReply({ embeds: [embed], components: [menu] }) : interaction.reply({ embeds: [embed], components: [menu], fetchReply: true }))
            const response = await message.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 60000 });
            if (!response) return;
            response.deferUpdate();
            if (response.values[0] === "antispam") configure("Anti-Spam", { toggle: config.antispam?.toggle || false, actions: config.antispam?.actions || [] }, "antispam")
            if (response.values[0] === "antilink") configure("Anti-Link", { toggle: config.antilink?.toggle || false, actions: config.antilink?.actions || [] }, "antilink")

        }
        async function configure(paramName, paramValue, paramKey) {
            let embed = {
                title: paramName,
                description: `**Status**: ${paramValue.toggle ? client.botemojis.yes : client.botemojis.no}\n\n${client.botemojis.role} **Actions**\n${paramValue.actions.map((v) => `\`${v.charAt(0).toUpperCase() + v.slice(1)}\``).join("\n") || "No actions"}`,
                color: process.env.COLOR,
                footer: { text: "Securd - Your Security", icon_url: client.user.displayAvatarURL() },
            }
            let menu = () => new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder({ customId: paramKey, placeholder: "Securd" })
                    .addOptions(
                        {
                            label: `${paramValue.toggle ? "Disable" : "Enable"}`,
                            description: `${paramValue.toggle ? "Disable" : "Enable"} the anti-spam system`,
                            value: "toggle",
                            emoji: { id: client.util.getEmojiId(paramValue.toggle ? client.botemojis.yes : client.botemojis.no) }
                        },
                        {
                            label: "Actions",
                            description: "Configure the actions",
                            value: "actions",
                            emoji: { id: client.util.getEmojiId(client.botemojis.role) }
                        },
                        {
                            label: "Back",
                            description: "Go back to the main menu",
                            value: "back",
                            emoji: { id: client.util.getEmojiId(client.botemojis.back) }
                        }
                    )
            )
            let collect = true;
            const message = await interaction.editReply({ embeds: [embed], components: [menu()] });
            const collector = message.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id && collect, time: 60000 });
            collector.on("collect", async (response) => {
                const value = response.values[0];
                if (value === "back") {
                    response.deferUpdate();
                    collector.stop();
                    await chooseaOption();
                } else if (value === "toggle") {
                    paramValue.toggle = !(paramValue.toggle || false)
                    config[paramKey] = paramValue;
                    guildManager.set("automod", config).save();
                    response.deferUpdate();
                    update();
                } else if (value === "actions") {
                    let actions = [...(paramValue?.actions || [])];
                    collect = false;
                    let buttonActions = new ActionRowBuilder().addComponents(
                        new ButtonBuilder({ customId: "reply", label: "Reply", style: 1 }),
                        new ButtonBuilder({ customId: "delete", label: "Delete", style: 1 }),
                        new ButtonBuilder({ custom_id: "mute", label: "Mute", style: 1 }),
                        new ButtonBuilder({ custom_id: "valid", emoji: { id: client.util.getEmojiId(client.botemojis.yes) }, style: 3 })
                    );
                    const reply = await response.reply({ components: [buttonActions], fetchReply: true });
                    const actionsCollector = reply.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });
                    actionsCollector.on("collect", async (response) => {
                        response.deferUpdate();
                        if (response.customId === "valid") {
                            actionsCollector.stop();
                            paramValue.actions = actions;
                            config[paramKey] = paramValue;
                            guildManager.set("automod", config).save();
                            reply.delete();
                            collect = true;
                            update();
                            return;
                        } else if (response.customId === "reply") {
                            actions.includes("reply") ? actions = actions.filter(a => a !== "reply") : actions.push("reply");
                            update(actions)
                        } else if (response.customId === "delete") {
                            actions.includes("delete") ? actions = actions.filter(a => a !== "delete") : actions.push("delete");
                            update(actions)
                        } else if (response.customId === "mute") {
                            actions.includes("mute") ? actions = actions.filter(a => a !== "mute") : actions.push("mute");
                            update(actions)
                        }
                    })
                }
            });
            function update(act = [...(paramValue?.actions || [])]) {
                embed.description = `**Status**: ${paramValue.toggle ? client.botemojis.yes : client.botemojis.no}\n\n${client.botemojis.role} **Actions**\n${act.map((v) => `\`${v.charAt(0).toUpperCase() + v.slice(1)}\``).join("\n") || "No actions"}`;
                message.edit({ embeds: [embed], components: [menu()] });
            }
        }
    }
}

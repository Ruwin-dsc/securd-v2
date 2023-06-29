const { CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder, ButtonBuilder } = require("discord.js"),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "permissions",
    description: "Set permissions for a user or a role",

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */
    async run(client, interaction) {
        const guildManager = client.managers.guildManager.getOrCreate(interaction.guild.id);
        if (interaction.user.id !== interaction.guild.ownerId && !(guildManager.get("crowns") || []).includes(interaction.user.id)) return interaction.reply({ content: `${client.botemojis.no} | You don't have permission to use this command`, ephemeral: true });
        chooseaItem()
        async function chooseaItem() {
            let embed = {
                description: "Choose an Option",
                color: process.env.COLOR,
                footer: { iconURL: client.user.avatarURL(), text: "Securd" },
            };
            let menu = new ActionRowBuilder().setComponents(
                new StringSelectMenuBuilder()
                    .setPlaceholder("Securd")
                    .setCustomId("choose-a-item")
                    .addOptions(
                        {
                            label: "Member",
                            value: "member",
                            emoji: { id: client.util.getEmojiId(client.botemojis.user) }
                        },
                        {
                            label: "Role",
                            value: "role",
                            emoji: { id: client.util.getEmojiId(client.botemojis.role) }
                        }
                    )
            )
            const reply = interaction.replied ? await interaction.editReply({ embeds: [embed], components: [menu] }) : await interaction.reply({ embeds: [embed], components: [menu] });
            const response = await reply.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
            response.deferUpdate().catch((e) => { });

            if (response.values[0] === "member") chooseaMember();
            if (response.values[0] === "role") chooseaRole();
        }

        async function chooseaMember() {
            let embed = {
                description: "Choose a Member",
                color: process.env.COLOR,
                footer: { iconURL: client.user.avatarURL(), text: "Securd" },
            };
            let menu = new ActionRowBuilder().setComponents(
                new UserSelectMenuBuilder()
                    .setPlaceholder("Securd")
                    .setCustomId("choose-a-member")
            )
            const reply = interaction.replied ? await interaction.editReply({ embeds: [embed], components: [menu] }) : await interaction.reply({ embeds: [embed], components: [menu] });
            const collector = reply.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
            collector.on("collect", async (response) => {
                response.deferUpdate().catch((e) => { });
                const member = await interaction.guild.members.fetch(response.users.first().id);
                if (!client.util.memberManageable(interaction.member, member, interaction.guild.ownerId)) return response.reply({ content: "You can't manage this member", ephemeral: true });
                collector.stop();
                editPermissions(response.users.first(), reply);
            })
        }


        async function chooseaRole() {
            let embed = {
                description: "Choose a Role",
                color: process.env.COLOR,
                footer: { iconURL: client.user.avatarURL(), text: "Securd" },
            };
            let menu = new ActionRowBuilder().setComponents(
                new RoleSelectMenuBuilder()
                    .setPlaceholder("Securd")
                    .setCustomId("choose-a-role")
            )
            const reply = await (interaction.replied ? interaction.editReply({ embeds: [embed], components: [menu] }) : interaction.reply({ embeds: [embed], components: [menu] }))
            const collector = reply.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id, time: 60000 });
            collector.on("collect", async (response) => {
                response.deferUpdate().catch((e) => { });
                const role = await interaction.guild.roles.fetch(response.values[0]);
                if (!client.util.roleManageable(interaction.member, role, interaction.guild.ownerId)) return response.reply({ content: "You can't manage this role", ephemeral: true });
                collector.stop();
                editPermissions(role, reply);
            });
        }

        async function editPermissions(item, message) {
            const itemPermissionsManager = client.managers.permissionManager.getOrCreate(item.id || item.id, interaction.guild.id);
            function embed(permissions) {
                return {
                    title: `**${item.name || item.username}**'s Permissions`,
                    description: `**Permissions:** ${(permissions || itemPermissionsManager.all()).map((p) => `\`${p}\``).join(", ") || "None"}`,
                    color: process.env.COLOR,
                    footer: { iconURL: client.user.avatarURL(), text: "Securd" },
                }
            }
            function choosePermissionsEmbed(string, permissions) {
                return {
                    title: `**${item.name || item.username}**'s Permissions`,
                    description: `**Current:** ${itemPermissionsManager.all().map((p) => `\`${p}\``).join(", ") || "None"}\n**${string}**: ${permissions.map((p) => `\`${p}\``).join(", ") || "None"}`,
                    color: process.env.COLOR,
                    footer: { iconURL: client.user.avatarURL(), text: "Securd" },
                }
            }
            message.edit({ embeds: [embed()], components: [itemPermissionsButtons()] })

            function itemPermissionsButtons() {
                let menu = new ActionRowBuilder().setComponents(
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.plus) }, customId: "add-permission", style: 1 }),
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.minus) }, customId: "remove-permission", style: 1, disabled: itemPermissionsManager.all().length === 0 ? true : false }),
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.back) }, customId: "back", style: 2 })
                )
                return menu;
            }
            const cl = message.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && ["add-permission", "remove-permission", "back"].includes(i.customId), time: 60000 })

            cl.on("collect", async (response) => {
                response.deferUpdate().catch((e) => { })
                if (response.customId === "back") return (cl.stop(), chooseaItem())
                choosePermissions(response.customId === "remove-permission" ? true : false)
            })
            async function choosePermissions(remove) {
                let menu = new StringSelectMenuBuilder().setCustomId("choose-permission").setPlaceholder("Securd");
                if (remove) {
                    for (let permission of itemPermissionsManager.all()) {
                        menu.addOptions({ label: permission, value: permission });
                    }
                } else {
                    for (let permission of client.util.permissions) {
                        if (!itemPermissionsManager.has(permission)) menu.addOptions({ label: permission, value: permission });
                    }
                }

                let buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.yes) }, customId: "valid", style: 3 }),
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.no) }, customId: "cancel", style: 4 }))

                let choosedPerms = []
                const reply = await message.edit({ embeds: [embed()], components: [new ActionRowBuilder().setComponents(menu), buttons] });

                const permissionsCollector = reply.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id && ["valid", "cancel", "choose-permission"].includes(i.customId), time: 60000 });
                permissionsCollector.on("collect", async (response) => {
                    response.deferUpdate().catch((e) => { })
                    if (response.customId === "valid") {
                        if (choosedPerms.length === 0) return;
                        if (remove) {
                            itemPermissionsManager.removeMany(choosedPerms).save();
                        } else {
                            itemPermissionsManager.addMany(choosedPerms).save();
                        }
                        permissionsCollector.stop();
                        return editPermissions(item, message);
                    } else if (response.customId === "cancel") {
                        permissionsCollector.stop();
                        return editPermissions(item, message);
                    } else if (response.customId === "choose-permission") {
                        if (choosedPerms.includes(response.values[0])) {
                            choosedPerms = choosedPerms.filter((p) => p !== response.values[0]);
                        } else {
                            choosedPerms.push(response.values[0]);
                        }
                        message.edit({ embeds: [choosePermissionsEmbed(remove ? "Remove" : "Add", choosedPerms)] })
                    }
                })
            }
        }

    }
}
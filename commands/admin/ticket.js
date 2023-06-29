const { StringSelectMenuBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "ticket",
    description: "Ticket commands",
    userPermissions: ["Administrator"],
    options: [
        {
            name: "panel",
            description: "Allows you to have the tickets panel",
            type: 2,
            options: [
                {
                    name: "create",
                    description: "Allows to create a tickets panel",
                    type: 1
                },
                {
                    name: "delete",
                    description: "Allows to delete a tickets panel",
                    type: 1
                },
            ]
        },
        {
            name: "list",
            description: "Lists the tickets panels on the server",
            type: 1
        }
    ],
    async run(client, interaction) {
        const guildManager = client.managers.guildManager.getOrCreate(interaction.guild.id);
        let tickets = guildManager.get("ticket") || { name: undefined, channel: undefined, managers: [], create: true, description: "Press the 🎫 button below to open a ticket", parent: undefined }
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommandGroup === "panel") {
            if (subcommand === "create") {
                let ticket = await ticketMessage();
                const message = await interaction.reply({ ...ticket, fetchReply: true })
                collectTicketComponents(message, { name: undefined, channel: undefined, managers: [], create: true })
            } else if (subcommand === "delete") {
                const target = await chooseaTicket();
                tickets = {}
                for await (const key of Object.keys(guildManager.get("ticket"))) {
                    if (key !== target.name) {
                        tickets[key] = guildManager.get("ticket")[key];
                    }
                }
                console.log(tickets)
                guildManager.set("ticket", tickets).save()
                interaction.editReply({ content: "Tickets panel deleted", ephemeral: true, components: [] })
            }
        } else if (subcommand === "list") {
            let embed = {
                title: "List of tickets panels",
                description: Object.keys(tickets).map((key) => `${key} - <#${tickets[key].channel}>`).join("\n") || "None",
            }
            interaction.reply({ embeds: [embed], ephemeral: true })
        }
        async function chooseaTicket() {
            if (Object.keys(tickets).length === 0) {
                interaction.reply({ content: "There are no tickets panels on the server", ephemeral: true })
                return undefined;
            }
            let menu = new StringSelectMenuBuilder().setCustomId("menu-chooseaTicket").setPlaceholder("Securd")
            for await (const key of Object.keys(tickets)) {
                menu.addOptions({ label: key, value: key })
            }
            const message = await interaction.reply({ content: "Please choose a tickets panel below", components: [new ActionRowBuilder().setComponents(menu)], fetchReply: true })
            const response = await message.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60000
            })
            response.deferUpdate();

            return tickets[response.values[0]]
        }
        async function ticketMessage(ticket = { channel: undefined, name: undefined, managers: [], create: true }) {
            let embed = {
                title: "Ticket Panel",
                fields: [
                    { name: "Name", value: `${ticket.name || "None"}` },
                    { name: "Description", value: `${ticket.description ? ticket.description : "None"}` },
                    { name: `Parent`, value: `${ticket.categorie ? `<#${ticket.categorie}>` : "None"}` },
                    { name: `Channel`, value: `${ticket.channel ? `<#${ticket.channel}>` : "None"}` },
                    { name: `Support Roles`, value: `${(ticket.managers || []).map((id) => `<@&${id}>`).join(", ") || "None"}` }
                ],
            };
            let options = [
                {
                    label: "Name",
                    description: "Edit the name",
                    value: "name"
                },
                {
                    label: "Description",
                    description: "Edit the description",
                    value: "description"
                },
                {
                    label: "Parent",
                    description: "Edit the parent id",
                    value: "categorie"
                },
                {
                    label: "Channel",
                    description: "Edit the channel",
                    value: "channel"
                },
                {
                    label: "Manager Roles",
                    description: "Edit the manager roles",
                    value: "managers"
                },
                {
                    label: `${ticket.create ? "Create" : "Save"}`,
                    description: `${ticket.create ? "Create" : "Save"} the ticket panel`,
                    value: "save-or-create"
                }
            ];
            let menu = new StringSelectMenuBuilder().setCustomId("ticket-panel").setPlaceholder("Securd");

            for (const option of options) {
                if (option.value === "channel") {
                    if (ticket.create) menu.addOptions(option);
                } else menu.addOptions(option);
            }
            return { embeds: [embed], components: [new ActionRowBuilder().setComponents(menu)] };
        }

        function collectTicketComponents(message, ticket) {
            const collector = message.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 300000
            });
            collector.on("collect", async (collected) => {
                const value = collected.values[0];
                if (value === "name") {
                    await collected.reply({ content: "What is the name of the ticket panel?\nThe name must be unique", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        if (tickets[response.content]) return error(response, "A ticket panel already exists with this name");
                        ticket.name = response.content;
                        update(response)
                    })
                }
                else if (value === "description") {
                    await collected.reply({ content: "What is the description of the ticket panel?", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        ticket.description = response.content;
                        update(response)
                    })

                } else if (value === "channel") {
                    await collected.reply({ content: "What is the channel of the ticket panel?", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        const channel = client.util.getChannel(response, response.content)
                        if (!channel || channel.type !== 0) return error(response, "Invalid channel")
                        ticket.channel = channel.id;
                        update(response)
                    })
                } else if (value === "categorie") {
                    await collected.reply({ content: "What is the parent of the ticket panel?", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        const channel = client.util.getChannel(response, response.content)
                        if (!channel || channel.type !== 4) return error(response, "Invalid parent")
                        ticket.categorie = channel.id;
                        update(response)
                    })
                } else if (value === "managers") {
                    const row = new ActionRowBuilder().setComponents(
                        new RoleSelectMenuBuilder()
                            .setPlaceholder("Securd")
                            .setCustomId("managers-menu")
                    );
                    const button = new ActionRowBuilder().setComponents(
                        new ButtonBuilder({ emoji: { name: "✅" }, style: 3, custom_id: "ok" })

                    )
                    const reply = await collected.reply({
                        content: "Please choose one or more role(s)\n*✅ to confirm the roles*",
                        components: [row, button],
                        fetchReply: true
                    });

                    const roles = [];

                    interaction.channel.createMessageComponentCollector({
                        filter: (i) => i.user.id === interaction.user.id && i.message.id === reply.id,
                    }).on("collect", async (response) => {
                        const v = response.customId;

                        if (v === "managers-menu") {
                            const role = response.roles.first();

                            if (role.managed) {
                                return response.reply({ content: "Invalid role", ephemeral: true });
                            }

                            response.deferUpdate();
                            roles.push(role.id);
                            response.message.edit({
                                content: `Please choose one or more role(s)\n*✅ to confirm the roles*\n${roles.map((role) => `<@&${role}>`).join(" ,") || ""}`,
                                components: [row, button],
                                fetchReply: true
                            });
                        } else if (v === "ok") {
                            ticket.managers = roles;
                            collected.deleteReply();
                            update();
                        }
                    });

                } else if (value === "save-or-create") {
                    if (!ticket.name) {
                        return collected.reply({ content: "Please specify a name for the ticket panel", ephemeral: true });
                    }

                    if (!ticket.channel) {
                        return collected.reply({ content: "Please specify a channel for the ticket panel", ephemeral: true });
                    }

                    if (ticket.create) {
                        const channel = interaction.guild.channels.cache.get(ticket.channel);

                        let embed = {
                            title: ticket.name,
                            description: ticket.description,
                        };

                        let button = new ActionRowBuilder().setComponents(
                            new ButtonBuilder({ custom_id: `ticket-open`, emoji: { name: "🎫" }, style: 2 })
                        );

                        channel.send({ embeds: [embed], components: [button] }).then((ticketM) => {
                            interaction.editReply({ content: "Ticket panel created", embeds: [], components: [] });
                            tickets[ticket.name] = { name: ticket.name, managers: ticket.managers, channel: ticket.channel, message: ticketM.id };
                            guildManager.set("ticket", tickets).save()
                        }).catch((e) => {
                            console.log(e)
                            collected.reply({ content: "I couldn't post the message in the channel", ephemeral: true });
                        });
                    }
                }

                function msgCollector() {
                    return interaction.channel.createMessageCollector({
                        filter: (m) => m.author.id === interaction.user.id,
                        max: 1,
                        time: 60000
                    })
                }
                function error(response, content) {
                    response.reply(content).then((m) => setTimeout(() => (m.delete(), response.delete(), collected.deleteReply()), 3000))
                }
                async function update(response) {
                    message.edit(await ticketMessage(ticket));
                    response?.delete().catch((e) => { })
                    collected.deleteReply().catch((e) => { })
                }
            })
        }

    }
}
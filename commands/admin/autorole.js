const { ActionRowBuilder, ButtonBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder } = require("discord.js");

module.exports = {
    name: "autorole",
    description: "Configure the autorole",
    userPermissions: ["Administrator"],

    async run(client, interaction) {
        const guildManager = client.managers.guildManager.getOrCreate(interaction.guild.id);
        const config = guildManager.get("autorole") || { roles: undefined, toggle: undefined }

        const message = await interaction.reply({ embeds: [embed()], components: [buttons()], fetchReply: true })

        function embed() {
            return {
                title: `Autorole`,
                color: process.env.COLOR,
                fields: [
                    { name: `${client.botemojis.user} Roles`, value: config.roles?.map((r) => `<@&${r}>`).join(", ") || "None" },
                    { name: `Enabled`, value: config.toggle ? client.botemojis.yes : client.botemojis.no }
                ]
            }
        }
        function update() {
            interaction.editReply({ embeds: [embed()], components: [buttons()] })
            guildManager.set("autorole", config).save()
        }
        function buttons() {
            return new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder({ label: "Role", custom_id: "role", style: 1 }),
                    new ButtonBuilder({ label: config.toggle ? "Disabled" : "Enabled", style: config.toggle ? 4 : 3, custom_id: "toggle" })
                )
        }
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 300000
        })
        collector.on("collect", async (collected) => {
            const value = collected.customId
            if (value === "toggle") {
                collected.deferUpdate();
                config.toggle = config.toggle ? false : true;
                update()
            } else if (value === "role") {
                const row = new ActionRowBuilder().setComponents(
                    new RoleSelectMenuBuilder()
                        .setPlaceholder("Securd")
                        .setCustomId("roles")
                )
                const button = new ActionRowBuilder().setComponents(
                    new ButtonBuilder({ emoji: { id: client.util.getEmojiId(client.botemojis.yes) }, style: 3, custom_id: "ok" })
                )
                const reply = await collected.reply({ content: "Please select one or more role(s)", components: [row, button], fetchReply: true })
                const roles = [];
                reply.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 120000
                }).on("collect", async (response) => {
                    const v = response.customId;
                    if (v === "roles") {
                        const role = response.roles.first();
                        if (role.managed) return response.reply({ content: "Invalid role", ephemeral: true });
                        if (!client.util.roleManageable(interaction.member, role, interaction.guild.ownerId)) return response.reply({ content: "You can't manage this role", ephemeral: true });
                        response.deferUpdate();
                        roles.push(role.id);
                        response.message.edit({ content: `Please select one or more role(s)\n${roles.map((role) => `<@&${role}>`).join(" ,") || ""}`, components: [row, button], fetchReply: true })
                    } else if (v === "ok") {
                        config.roles = roles;
                        collected.deleteReply();
                        update();
                    }
                })
            }
        })
    }
}
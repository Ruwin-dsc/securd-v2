const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    name: "ghostpings",
    description: "Allows to display the configuration panel of the server ghostpings",
    userPermissions: ["Administrator"],


    async run(client, interaction) {
        const guildData = client.managers.guildManager.getOrCreate(interaction.guild.id);
        let ghostpings = guildData.get("ghostpings") || [] 
        

        const buttons = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder({ emoji: { name: "➕" }, custom_id: "add", style: 1 }),
                new ButtonBuilder({ emoji: { name: "➖" }, custom_id: "del", style: 1 }),
                new ButtonBuilder({ emoji: { name: "🗑️" }, custom_id: "clear", style: 4 }),
            )

        const message = await interaction.reply({ embeds: [embed()], components: [buttons], fetchReply: true });
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 120000
        })
        collector.on("collect", async (button) => {
            const value = button.customId;
            if (value === "add") {
                await button.reply({ content: "What is the salon for ghostping?", fetchReply: true });
                msgCollector().on("collect", async (response) => {
                    const channel = client.util.getChannel(response, response.content);
                    if (!channel || channel.type !== 0 && channel.type !== 5) return error(response, "Invalid channel");
                    ghostpings.push(channel.id);
                    update(response);
                })
            } else if (value === "del") {
                if (ghostpings.length === 0) return button.reply({ content: "There is no ghostping on the server", ephemeral: true });
                let menu = new StringSelectMenuBuilder().setCustomId("menu-del-ghostping").setPlaceholder("Securd")
                for await (const channelId of ghostpings) {
                    menu.addOptions({ label: interaction.guild.channels.cache.get(channelId)?.name || channelId, value: channelId })
                }
                const reply = await button.reply({ content: "Please choose a ghostping below", components: [new ActionRowBuilder().setComponents(menu)], fetchReply: true });
                const response = await reply.awaitMessageComponent({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 600000
                });
                ghostpings = ghostpings.filter(c => c !== response.values[0]);
                update()
            } else if (value === "clear") {
                const buttonsYesOrNo = new ActionRowBuilder().setComponents(
                    new ButtonBuilder({ label: "Yes", style: 3, custom_id: "yes" }),
                    new ButtonBuilder({ label: "No", style: 4, custom_id: "no" })
                )
                const reply = await button.reply({ content: "Are you going to delete all the ghostpings on the server?", fetchReply: true, components: [buttonsYesOrNo] })
                const response = await reply.awaitMessageComponent({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 600000
                });
                if (response.customId === "yes") {
                    ghostpings = [];
                    update()
                } else {
                    update()
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
                response.reply(content).then((m) => setTimeout(() => (m.delete(), response.delete(), button.deleteReply()), 3000))
            }
            function update(response) {
                interaction.editReply({ embeds: [embed()] })
                response?.delete().catch((e) => { })
                button.deleteReply().catch((e) => { })
                guildData.set("ghostpings", ghostpings).save()
            }
        })
        function embed() {
            return {
                title: "Ghostpings",
                description: `\n${ghostpings.map((c) => `<#${c}>`).join("\n") || "N/A"}`,
            }
        }
    }
}
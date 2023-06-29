const { ActionRowBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
    name: "tempvoc",
    description: "Allows you to configure the temporary voice system",
    userPermissions: ["Administrator"],

    async run(client, interaction) {
        const guildData = client.managers.guildManager.getOrCreate(interaction.guild.id);
        const config = guildData.get("tempvoc") || {
            prefix: "⏲️-",
            channel: "",
            toggle: false,
        }
        const message = await interaction.reply({ embeds: [embed()], components: [buttons()], fetchReply: true });
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 120000
        });


        collector.on("collect", async (button) => {
            const value = button.customId;

            if (value === "channel") {
                await button.reply({ content: "What is the temporary vocals show?", fetchReply: true });
                msgCollector().on("collect", async (response) => {
                    const channel = client.util.getChannel(response, response.content);
                    if (!channel || channel.type !== 2) return error(response, "Invalid channel");
                    config.channel = channel.id;
                    response.delete();
                    button.deleteReply();
                    update();
                })
            } else if (value === "prefix") {
                await button.reply({ content: "What is the prefix of the temporary vocals?", fetchReply: true });
                msgCollector().on("collect", async (response) => {
                    const prefix = response.content;
                    if (prefix.length > 10) return error(response, "The prefix cannot exceed 10 characters");
                    config.prefix = prefix;
                    response.delete();
                    button.deleteReply();
                    update();
                })
            } else if (value === "toggle") {
                button.deferUpdate();
                config.toggle = config.toggle ? false : true;
                update();
            }

            function msgCollector() {
                return interaction.channel.createMessageCollector({
                    filter: (m) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 60000
                })
            }
            function error(response, content) {
                response.reply(content).then((m) => setTimeout(() => (m.delete(), button.deleteReply(), response.delete()), 3000))
            }
            function update() {
                interaction.editReply({ embeds: [embed()], components: [buttons()] })
                guildData.set("tempvoc", config).save()
            }
        })


        function embed() {
            return {
                title: "・ Temporary vocal panel",
                description: `
                \`\`\`\nCurrent prefix : ${config.prefix}\nCurrent channel: ${config.channel ? `${interaction.guild.channels.cache.get(config.channel).name} (ID : ${config.channel})` : `None`}\nStatut: ${config.toggle ? "Enabled" : "Disabled"}\`\`\``,
                color: process.env.COLOR
            }
        }
        function buttons() {
            return new ActionRowBuilder().setComponents(
                new ButtonBuilder({ label: "Channel", custom_id: "channel", style: 1 }),
                new ButtonBuilder({ label: "Prefix", custom_id: "prefix", style: 1 }),
                new ButtonBuilder({ label: config.toggle ? "Disabled" : "Enabled", custom_id: "toggle", style: config.toggle ? 4 : 3 }),
            )
        }
    }
}
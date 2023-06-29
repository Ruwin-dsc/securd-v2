const { ActionRowBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
    name: "soutien",
    description: "Allows you to configure soutien status",
    options: [
        { name: "config", description: "Allows you to configure the support system", type: 1 },
        { name: "list", description: "Allows you to list all people with the support role", type: 1 }],
    userPermissions: ["Administrator"],
    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */
    async run(client, interaction) {
        const guildData = client.managers.guildManager.getOrCreate(interaction.guild.id);
        const cmd = interaction.options.getSubcommand();
        if (cmd === "config") {
            let config = guildData.get("soutien") || {
                message: undefined,
                role: undefined,
                toggle: false,
            }

            const message = await interaction.reply({ embeds: [embed()], components: [buttons()], fetchReply: true })

            const collector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id && i.message.id === message.id,
                time: 300000
            })
            collector.on("collect", async (collected) => {
                const id = collected.customId;
                if (id === "role") {
                    collected.reply({ content: "What is the role?", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        const role = client.util.getRole(response, response.content);
                        if (!role || role.managed) return response.reply("Invalid role").then((m) => setTimeout(() => (m.delete(), response.delete(), collected.deleteReply()), 3000))
                        config.role = role.id;
                        update()
                        collected.deleteReply();
                        response.delete()
                    })
                } else if (id === "message") {
                    collected.reply({ content: "What is the statut?", fetchReply: true });
                    msgCollector().on("collect", async (response) => {
                        config.message = response.content;
                        update()
                        collected.deleteReply();
                        response.delete()
                    })
                } else if (id === "toggle") {
                    collected.deferUpdate()
                    config.toggle = config.toggle ? false : true;
                    update();
                }
            })


            function msgCollector() {
                return interaction.channel.createMessageCollector({
                    filter: (m) => m.author.id === interaction.user.id,
                    max: 1
                })
            }
            function buttons() {
                return new ActionRowBuilder().setComponents(
                    new ButtonBuilder({ label: "Message", style: 1, custom_id: "message" }),
                    new ButtonBuilder({ label: "Role", style: 1, custom_id: "role" }),
                    new ButtonBuilder({ label: config.toggle ? "Disabled" : "Enabled", style: config.toggle ? 4 : 3, custom_id: "toggle" })
                )
            }
            function embed() {
                return {
                    title: "・ Soutien config",
                    description: `
                    \`\`\`\nCurrent Role : ${config.role ? `<@&${config.role}>` : "None"}\nCurrent message: ${config.message || "None"}\nStatut: ${config.toggle ? "Disabled" : "Enabled"}\`\`\``,
                    color: process.env.COLOR,
                }
            }
            function update() {
                guildData.set("soutien", config).save()
                interaction.editReply({ embeds: [embed()] })
            }
        } else if (cmd === "list") {
            const config = guildData.get("soutien");
            if (!config.role) return interaction.reply({ content: "The support role has not been defined, to define it use the command /soutien config", ephemeral: true })
            const members = interaction.guild.members.cache.filter((m) => m.roles.cache.has(config.role));

            let embed = {
                title: "Soutien",
                description: members.map((m) => `${m}`).join("\n") || "N/A",
            }
            interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}
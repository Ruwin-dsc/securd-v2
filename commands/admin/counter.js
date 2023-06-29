const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    name: "counter",
    description: "Allows you to configure the server counters",
    userPermissions: ["Administrator"],

    async run(client, interaction) {
        const guildData = client.managers.guildManager.getOrCreate(interaction.guild.id);
        let config = guildData.get("counters") || {
            members: {
                channel: undefined,
                name: undefined,
            },
            bots: {
                channel: undefined,
                name: undefined,
            },
            online: {
                channel: undefined,
                name: undefined,
            },
            voice: {
                channel: undefined,
                name: undefined,
            },
            boosts: {
                channel: undefined,
                name: undefined,
            },
            offline: {
                channel: undefined,
                name: undefined,
            }
        }
        let menu = new ActionRowBuilder()
            .setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("counters-menu")
                    .setPlaceholder("Securd")
                    .addOptions(
                        {
                            label: "Members",
                            value: "members",
                            description: "Edit members counter",
                        },
                        {
                            label: "Bots",
                            value: "bots",
                            description: "Modify the bots counter",
                            emoji: { name: "🤖" }
                        },
                        {
                            label: "online",
                            value: "online",
                            description: "Edit online member counter",
                            emoji: { name: "🟢" }
                        },
                        {
                            label: "Offline",
                            value: "offline",
                            description: "Change offline member counter",
                            emoji: { name: "⚪" }
                        },
                        {
                            label: "In voice",
                            value: "voice",
                            description: "Change the member counter to voice",
                            emoji: { name: "🔊" }
                        }
                    )
            )
        const message = await interaction.reply({ embeds: [embed()], components: [menu], fetchReply: true });
        const collector = message.createMessageComponentCollector({
            time: 30000, filter: (i) => i.user.id === interaction.user.id
        });
        collector.on("collect", async (collected) => {
            const key = collected.values[0];
            await collected.reply({ content: "What is the channel", fetchReply: true })
            let result = { channel: undefined, name: undefined };
            let channelCollector = msgCollector();
            channelCollector.on("collect", async (m) => {
                const channel = client.util.getChannel(m, m.content);
                if (!channel) return error(m, "Invalid channel")

                result.channel = channel.id;
                const _reply = await m.reply("What is the name of the counter ?\n**{count} = value**")
                let nameCollector = msgCollector();
                nameCollector.on("collect", (_m) => {
                    result.name = _m.content;
                    _m.delete();
                    collected.deleteReply();
                    _reply.delete();
                    m.delete();
                    config[key] = result;
                    update();
                })
            })


            function msgCollector(max = 1) {
                return interaction.channel.createMessageCollector(
                    { filter: (i) => i.author.id === interaction.user.id, time: 30000, max }
                )
            }
            function error(response, content) {
                response.reply(content).then((m) => {
                    setTimeout(() => {
                        m.delete();
                        collected.deleteReply();
                        response.delete()
                    }, 3000)
                })
            }
            function update() {
                guildData.set("counters", config).save()
                message.edit({ embeds: [embed()], components: [menu] });
            }
        })





        function embed() {
            return {
                title: "Compteurs",
                fields: [
                    { name: `👤 Members`, value: `Channels: ${config.members.channel ? `<#${config.members.channel}>` : "N/A"}\nName: ${config.members.name ? config.members.name : "Indéfini"}`, inline: true },
                    { name: "🤖 Bots", value: `Channels: ${config.bots.channel ? `<#${config.bots.channel}>` : "N/A"}\nName: ${config.bots.name ? config.bots.name : "N/A"}`, inline: true },
                    { name: "🟢 Inline", value: `Channels: ${config.online.channel ? `<#${config.online.channel}>` : "N/A"}\nName: ${config.online.name ? config.online.name : "N/A"}`, inline: true },
                    { name: "⚪ Offline", value: `Channels: ${config.offline.channel ? `<#${config.offline.channel}>` : "N/A"}\nName: ${config.offline.name ? config.offline.name : "N/A"}`, inline: true },
                    { name: "🔊 In vocal", value: `Channels: ${config.voice.channel ? `<#${config.voice.channel}>` : "N/A"}\nName: ${config.voice.name ? config.voice.name : "N/A"}`, inline: true },
                    { name: "💎 Boosts", value: `Channels: ${config.boosts.channel ? `<#${config.boosts.channel}>` : "N/A"}\nName: ${config.boosts.name ? config.boosts.name : "N/A"}`, inline: true },
                ]
            }
        }
    }
}
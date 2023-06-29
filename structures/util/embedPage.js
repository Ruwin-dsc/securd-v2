const { CommandInteraction, ButtonBuilder, ActionRowBuilder } = require("discord.js");

/**
 * @param {CommandInteraction} interaction 
 */
module.exports = async (interaction, embeds, ephemeral = false, util) => {
    let i = 0;
    let n = embeds.length - 1
    Object.keys(embeds).forEach((key) => {
        embeds[key].footer = {iconURL: util.client.user.avatarURL(), text: `Securd - Your Security・${parseInt(key) + 1}/${embeds.length}`}
    });
    let buttons = new ActionRowBuilder().setComponents(
        new ButtonBuilder({ emoji: "<:left:1080200071439716372>", custom_id: "back", style: 2 }),
        new ButtonBuilder({ emoji: "<:right:1080199797115465891>", custom_id: "go", style: 2 }),
    )
    const message = await interaction.reply({ embeds: [embeds[0]], components: [buttons], fetchReply: true, ephemeral })
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000
    })
    collector.on("collect", async (collected) => {
        const value = collected.customId;
        collected.deferUpdate();
        if (value === "back") {
            if (i - 1 > n) {
                i = n;
            } else if(i - 1 < 0){
                i = n;
            }else i--;
            interaction.editReply({ embeds: [embeds[i]] })
        } else if (value === "go") {
            if (i + 1 > n) {
                i = 0;
            } else i++;
            interaction.editReply({ embeds: [embeds[i]] })
        }
    })
}
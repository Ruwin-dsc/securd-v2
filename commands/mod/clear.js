const { CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "clear",
    description: "Clear a message",
    userPermissions: ["ManageMessages"],
    options: [
        { name: "messages", description: "Number", type: 10, minValue: 1, maxValue: 99, required: true }
    ],

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const messages = interaction.options.getNumber("messages");
        interaction.channel.bulkDelete(messages).then(() => {
            interaction.reply({ content: `${messages} messages deleted` })
        }).catch((e) => {
            interaction.reply({ content: "I couldn't delete the messages from the lounge", ephemeral: true })
        })
    }
}
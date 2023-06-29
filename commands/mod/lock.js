const { CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "lock",
    description: "Lock a channel",
    userPermissions: ["ManageChannels"],
    options: [
        {name: "channel", required: false, description: "Channel", type: 7}
    ],

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {SendMessages: false}).then(() => {
             interaction.reply({content: "Channel locked"})
        }).catch((e) => {
             interaction.reply({content: "I couldn't lock the channel.", ephemeral: true})
        })
    }
}
const { CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "unlock",
    description: "Unlock a channel",
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
        channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {SendMessages: true}).then(() => {
             interaction.reply({content: "Channel unlocked"})
        }).catch((e) => {
             interaction.reply({content: "I couldn't unlock the channel.", ephemeral: true})
        })
    }
}
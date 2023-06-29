const { CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js'),
    Securd = require('../../structures/Securd');

module.exports = {
    name: "kick",
    description: "Kick a member",
    userPermissions: ["KickMembers"],
    options: [
        { name: "member", description: "Member", required: true, type: 6 },
        { name: "reason", description: "Reason", required: false, type: 3 },
    ],

    /**
     * @param {Securd} client
     * @param {CommandInteraction} interaction
     */

    async run(client, interaction) {
        const target = interaction.options.getMember("member");
        if (!target) return interaction.reply({ content: "Member not found", ephemeral: true });
        const reason = interaction.options.getString("reason") || "None";
        if (target.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "You can't kick this user because he has several roles above you", ephemeral: true })
        target.kick({reason : reason}).then(() => {
            interaction.reply({ content: `${target.user} has been kicked for **${reason}**` })
        }).catch((e) => {
            console.log(e)
            interaction.reply({ content: "error", ephemeral: true })
        })
    }
}
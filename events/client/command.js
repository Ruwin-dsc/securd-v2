const { Interaction } = require("discord.js"),
    Securd = require("../../structures/Securd");

module.exports = {
    name: "interactionCreate",

    /**
     * @param {Securd} client
     * @param {Interaction} interaction
     */

    async run(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command.userPermissions && !interaction.member.permissions.has(command.userPermissions)) return interaction.reply({ content: `${client.botemojis.no} | You don't have permission to use this command`, ephemeral: true, });
            if (!command) return;
            command.run(client, interaction);
        }
    }
}
require("dotenv").config();
const Securd = require("./structures/Securd");
const Discord = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');

const client = new Discord.Client({
    intents: Object.values(Discord.GatewayIntentBits),
    ws: {
        properties: {
            browser: 'Discord iOS'
        }
    },
});
let tickets = [];

client.on('ready', () => {
    console.log(client.user.tag)
     client.user.setPresence({
  activities: [{ name: `le serveur gravity`, type: ActivityType.Watching }],
  status: 'idle',
});
    new Securd()
})
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (tickets.includes(interaction.user.id)) {
        await interaction.reply({ content: 'Vous avez déjà un ticket', ephemeral: true });
        return;
    }
    const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        parent: '1102534229763567617',
        permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone.id,
                deny: [1024n],
            },
            {
                id: "1102509731270103040",
                allow: [1024n],
            },
            {
                id: interaction.user.id,
                allow: [1024n],
            },
        ],
    })

    tickets.push(interaction.user.id);
    // await interaction.reply({ content: `Je viens de créer votre ticket :  ${channel}`, ephemeral: true });
});
/* client.on('messageCreate', async message => {
    if (message.content === '!ticket') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('panel')
                    .setLabel('Securd - Modération')
                    .setStyle(ButtonStyle.Secondary))

        const embedd = {
            "color": "3092790",
            "image": {
                url: "https://media.discordapp.net/attachments/1043835099369717840/1102536811412201512/image_2023-05-01_103718567.jpg?width=1409&height=470"
            }
        }
        const embed = {
            "title": "Besoin de nous contacter ?",
            "description": "Vous avez la possibilité de contacter nos équipes grâce à un **ticket privé**. Veuillez renseigner toutes les informations nécessaires pour que l’on puisse vous répondre correctement.",
            "color": "3092790",
            "image": {
                url: "https://media.discordapp.net/attachments/924781769570517023/924781873073369148/Barre_Embed.png?width=960&height=15"
            }
        }
        await message.channel.send({ embeds: [embedd, embed], components: [row] });
    }
});
*/
client.on("guildMemberAdd", async member => {
    let channel = client.channels.cache.get('1102512335270203392');
    if (member.guild.id === "1099041324554014740") {


        channel?.send({ content: `:wave: Bienvenue ${member} sur ${member.guild.name}, nous sommes désormais \`${member.guild.memberCount}\` membres.` })
    }
    else {
        return;
    }
});

client.login("ODYzOTM5NTM4NTQ3MjQ1MDg3.Gk02vS.1Rb0afOZxMG5HXgu28-wfo-AQxwcG6yXzp1c3I");
process.on("uncaughtException", (e) => {
        if (e.code === 50013) return;
    console.log(e)
})
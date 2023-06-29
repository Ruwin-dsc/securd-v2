const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");

module.exports = {
     name: "interactionCreate",


     async run(client, button) {
          if (!button.isButton()) return;
          if (button.customId !== "ticket-open") return;
          const guildManager = client.managers.guildManager.getOrCreate(button.guild?.id);
          const tickets = guildManager.get("ticket");
          const ticketConfig = tickets[Object.keys(tickets).find((k) => tickets[k].message === button.message.id)]
          ticketConfig.tickets ? null : ticketConfig.tickets = []
          if (ticketConfig.tickets.find((t) => t.user === button.user.id)) return button.reply({ content: `You already have an open ticket<#${ticketConfig.tickets.find((t) => t.user === button.user.id).channel}>`, ephemeral: true });
          let data = {
               name: `ticket-${button.user.username}`,
               parent: tickets.categorie,
               permissionOverwrites: [{ id: button.user.id, allow: ["SendMessages", "ViewChannel"] }, {
                    id: button.guild.roles.everyone,
                    deny: ["SendMessages", "ViewChannel"]
               }],
               type: 0
          }
          for await (const role of ticketConfig.managers) {
               data.permissionOverwrites.push({ id: role, allow: ["SendMessages", "ViewChannel"] })
          }
          button.guild.channels.create(data).then((channel) => {
               button.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
               ticketConfig.tickets.push({ user: button.user.id, channel: channel.id });
               tickets[ticketConfig.name] = ticketConfig;
               guildManager.set("ticket", tickets).save()
               let embed = {
                    description: `Ticket from ${button.member}\n*To delete the ticket press the button 🔒*`,
               }
               const buttonrow = new ActionRowBuilder().setComponents(new ButtonBuilder({ emoji: { name: "🔒" }, custom_id: "ticket-close", style: 4 }))
               channel.send({ content: `${button.member}`, embeds: [embed], components: [buttonrow] })
          }).catch((e) => {
               button.reply({ content: "I could not create your ticket", ephemeral: true })
          })
     }
}
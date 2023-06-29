
module.exports = {
     name: "interactionCreate",

     async run(client, button) {
          if (!button.isButton()) return;
          if (button.customId !== "ticket-close") return;
          button.reply({ content: "This ticket will be closed in 5s" });
          setTimeout(() => {
               button.channel.delete().catch((e) => {
                    button.channel.send(`I couldn't close the ticket for some reason`)
               })
          }, 5000)
     }
}
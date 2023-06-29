
module.exports = {
     name: "channelDelete",

     async run(client, channel) {
          const guildManager = client.managers.guildManager.getOrCreate(channel.guild?.id);
          const tickets = guildManager.get("ticket") || {};
          const ticketConfig = tickets[Object.keys(tickets).find((k) => tickets[k].tickets?.find((t) => t.channel === channel.id))]
          if (!ticketConfig) return;
          ticketConfig.tickets = ticketConfig?.tickets?.filter((t) => t.channel !== channel.id)
          tickets[ticketConfig.name] = ticketConfig;
          guildManager.set("ticket", tickets)
     }
}
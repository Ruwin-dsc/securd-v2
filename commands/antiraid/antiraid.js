const {
  CommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require("discord.js"),
  Securd = require('../../structures/Securd');

module.exports = {
  name: "antiraid",
  description: "Configure the anti-raid system",

  /**
   * @param {Securd} client
   * @param {CommandInteraction} interaction
   */

  async run(client, interaction) {
    let currentMenu = "roles";
    let params = {
      roles: {
        create: {
          toggle: false,
          punish: "derank",
        },
        delete: {
          toggle: false,
          punish: "derank",
        },
        update: {
          toggle: false,
          punish: "derank",
        },
        add: {
          toggle: false,
          punish: "derank",
        },
        remove: {
          toggle: false,
          punish: "derank",
        },
      },
      channels: {
        create: {
          toggle: false,
          punish: "derank",
        },
        delete: {
          toggle: false,
          punish: "derank",
        },
        update: {
          toggle: false,
          punish: "derank",
        },
      },
      mass: {
        bans: {
          toggle: false,
          punish: "derank",
          limit: "3/h",
        },
        kicks: {
          toggle: false,
          punish: "derank",
          limit: "3/h",
        },
        pings: {
          toggle: false,
          punish: "derank",
          limit: "3/h",
        }
      },
      webhooks: {
        create: {
          toggle: false,
          punish: "derank",
        },
        delete: {
          toggle: false,
          punish: "derank",
        },
        update: {
          toggle: false,
          punish: "derank",
        },
      },
      bots: {
        add: {
          toggle: false,
          punish: "derank",
        },
      },
      voice: {
        massdeco: {
          toggle: true,
          punish: "derank",
          limit: "3/h",
        },
        massmute: {
          toggle: true,
          punish: "derank",
          limit: "3/h",
        },
        massdeaf: {
          toggle: true,
          punish: "derank",
          limit: "3/h",
        },
      },
    };
    const guildManager = client.managers.guildManager.getOrCreate(
      interaction.guildId
    );
    let config = guildManager.get("antiraid") || params;
    if (
      interaction.user.id !== interaction.guild.ownerId &&
      !(guildManager.get("crowns") || []).includes(interaction.user.id)
    )
      return interaction.reply({
        content: `${client.botemojis.no} | You don't have permission to use this command`,
        ephemeral: true,
      });

    const message = await interaction.reply({
      embeds: [embed()],
      components: [categoriesMenu(), subcategoriesMenu()],
      fetchReply: true,
    });
    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 120000,
    });
    collector.on("collect", async (i) => {
      if (i.customId === "menu1-antiraid") {
        i.deferUpdate();
        currentMenu = i.values[0];
        update();
      } else if (i.customId === "menu2-antiraid") {
        let param = params[currentMenu][i.values[0]];
        let newConfig = {};
        let toggleButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder({
            custom_id: "on",
            emoji: { id: client.util.getEmojiId(client.botemojis.yes) },
            style: 3,
          }),
          new ButtonBuilder({
            custom_id: "off",
            emoji: { id: client.util.getEmojiId(client.botemojis.no) },
            style: 4,
          })
        );
        let punishButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder({ custom_id: "derank", label: "Derank", style: 1 }),
          new ButtonBuilder({ custom_id: "kick", label: "Kick", style: 1 }),
          new ButtonBuilder({ custom_id: "ban", label: "Ban", style: 1 })
        );

        const reply = await i.reply({
          content: `Configuration: ${i.values[0]}\nWhat is the new toggle ?`,
          components: [toggleButtons],
          fetchReply: true,
        });
        const toggleResponse = await reply.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 120000,
        });
        if (toggleResponse.customId === "on") newConfig.toggle = true;
        else if (toggleResponse.customId === "off") {
          newConfig.toggle = false;
          newConfig.punish =
            config[currentMenu][i.values[0]]?.punish || "derank";
          if (param.limit)
            newConfig.limit = config[currentMenu][i.values[0]]?.limit || "3/h";
          i.deleteReply();
          config[currentMenu][i.values[0]] = newConfig;
          guildManager.set("antiraid", config).save();
          return update();
        }
        toggleResponse.deferUpdate();
        reply.edit({
          content: `Configuration: ${i.values[0]}\nWhat is the new punish ?`,
          components: [punishButtons],
        });
        const punishResponse = await reply.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 120000,
        });
        newConfig.punish = punishResponse.customId;
        punishResponse.deferUpdate();
        if (param.limit) {
          reply.edit({
            content: `Configuration: ${i.values[0]}\nWhat is the new limit ?\ne.g. \`3/h\` or \`1/h\``,
            components: [],
          });
          const limitCollector = interaction.channel.createMessageCollector({
            filter: (i) => i.author.id === interaction.user.id,
            time: 120000,
          });
          limitCollector.on("collect", async (limitResponse) => {
            limitCollector.stop();
            const number = limitResponse.content
              .trim()
              .split("/")[0]
              ?.toLowerCase();
            const time = limitResponse.content
              .trim()
              .split("/")[1]
              ?.toLowerCase();
            if (!number || !time) return error("Invalid limit");
            if (isNaN(number)) return error("Invalid number");
            if (!["h", "m", "s"].includes(time)) return error("Invalid time");
            newConfig.limit = `${parseInt(number)}/${time}`;
            limitResponse.delete();
            function error(content) {
              limitResponse
                .reply(`${client.botemojis.no} | ${content}`)
                .then((m) => {
                  setTimeout(() => {
                    m.delete();
                    i.deleteReply();
                    limitResponse.delete();
                  }, 3000);
                });
            }
            i.deleteReply();
            config[currentMenu][i.values[0]] = newConfig;
            guildManager.set("antiraid", config).save();
            update();
          });
        } else {
          i.deleteReply();
          config[currentMenu][i.values[0]] = newConfig;
          guildManager.set("antiraid", config).save();
          update();
        }
      }
    });
    function update() {
      interaction.editReply({
        embeds: [embed()],
        components: [categoriesMenu(), subcategoriesMenu()],
      });
    }
    function embed() {
      let param = params[currentMenu];
      let embed = {
        title: `Anti-raid: ${currentMenu}`,
        color: process.env.COLOR,
        fields: [],
        footer: {
          iconURL: client.user.avatarURL(),
          text: "Securd - Your Security",
        },
      };
      for (const key in param) {
        if (!config[currentMenu]) config[currentMenu] = params[currentMenu];
        embed.fields.push({
          name: `\`${key}\``,
          value: `${config[currentMenu][key].toggle
            ? client.botemojis.yes
            : client.botemojis.no
            } - ${config[currentMenu][key].punish}  ${config[currentMenu][key].limit
              ? `- ${config[currentMenu][key].limit}`
              : ""
            }`,
          inline: true,
        });
      }
      return embed;
    }
    function categoriesMenu() {
      let menu = new StringSelectMenuBuilder({
        custom_id: "menu1-antiraid",
        placeholder: "Category - Securd",
      });
      for (const key of Object.keys(params).filter((k) => k !== currentMenu)) {
        menu.addOptions({ label: key, value: key });
      }
      return new ActionRowBuilder().addComponents(menu);
    }
    function subcategoriesMenu() {
      let menu = new StringSelectMenuBuilder({
        custom_id: "menu2-antiraid",
        placeholder: "Subcategory - Securd",
      });
      for (const key of Object.keys(params[currentMenu])) {
        menu.addOptions({ label: key, value: key });
      }
      return new ActionRowBuilder().addComponents(menu);
    }
  },
};

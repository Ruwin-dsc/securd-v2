const { Client, Collection, Partials } = require("discord.js"),
    Discord = require('discord.js'),
    fs = require("fs"),
    { Sequelize } = require("sequelize")
class Managers {
    constructor(client) {
        this.guildManager = new (require("./guild"))(client).loadTable()
        this.permissionManager = new (require("./permission"))(client).loadTable()
    }
}


class Securd extends Client {
    constructor() {
        super({
            intents: Object.values(Discord.GatewayIntentBits), partials: [Partials.Message, Partials.Reaction]
        });
        this.commands = new Collection();
        this.util = new (require("./util"))(this);
        this.botemojis = new require("../emojis")
        this.database = new Sequelize({
            logging: false,
            dialect: 'sqlite',
            storage: 'database.sqlite'
          });

        this.init();
    }

    init() {
        this.initCommands();
        this.initEvents();
        this.initDatabase();
        this.login(process.env.TOKEN)
    }
    initCommands() {
        for (const dir of fs.readdirSync("./commands")) {
            for (const fileName of fs.readdirSync(`./commands/${dir}`)) {
                const file = require(`../commands/${dir}/${fileName}`);
                file.category = dir;
                this.commands.set(file.name, file)
                delete require.cache[require.resolve(`../commands/${dir}/${fileName}`)]
            }
        }
    }
    initEvents() {
        for (const dir of fs.readdirSync("./events")) {
            for (const fileName of fs.readdirSync(`./events/${dir}`)) {
                const file = require(`../events/${dir}/${fileName}`);
                this.on(file.name, (...args) => file.run(this, ...args))
                delete require.cache[require.resolve(`../events/${dir}/${fileName}`)]
            }
        }

        for (const dir of fs.readdirSync("./antiraidEvents")) {
            for (const fileName of fs.readdirSync(`./antiraidEvents/${dir}`)) {
                const file = require(`../antiraidEvents/${dir}/${fileName}`);

                file.ws === false ? this.on(file.name, (...args) => file.run(this, ...args)) : this.ws.on(file.name, (...args) => file.run(this, ...args));
                delete require.cache[require.resolve(`../antiraidEvents/${dir}/${fileName}`)]
            }
        }
    }
    initDatabase() {
        this.database.authenticate().then(() => {
            console.log("Database connected!");
            this.managers = new Managers(this);
        }).catch((err) => {
            console.log("Database connection failed!", err);
        })
    }
}

module.exports = Securd;
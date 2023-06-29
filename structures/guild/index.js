class Cache extends Map {
    constructor(client) {
        super();
        this.client = client;
    }
    createGuild(guildId, values = {}) {
        return this.set(guildId, new GuildManager(this, guildId, values)).get(guildId);
    }
    getOrCreate(guildId) {
        return this.has(guildId) ? this.get(guildId) : this.createGuild(guildId);
    }
    loadTable() {
        require("./model")(this.client);
        this.client.util.loadTable(this, { model: "guild", add: "createGuild", key: "id" });
        return this;
    }
}


class GuildManager {
    constructor(cache, guildId, values) {
        this.cache = cache;
        this.guildId = guildId;
        this.values = values;
    }
    get(key) {
        return this.values[key];
    }
    set(key, value) {
        this.values[key] = value;
        return this;
    }
    push(key, value) {
        if (!this.values[key]) this.values[key] = [];
        this.values[key].push(value);
        return this;
    }
    unpush(key, value) {
        if (!this.values[key]) this.values[key] = [];
        this.values[key] = this.values[key].filter(v => v !== value);
        return this;
    }
    save() {
        this.cache.client.database.models["guild"].findOne({ where: { id: this.guildId } }).then((data) => {
            if (data) {
                data.update(this.values)
            } else {
                this.cache.client.database.models["guild"].create({...this.values, id: this.guildId}, { where: { id: this.guildId } })
            }
        });
    }
}

module.exports = Cache;
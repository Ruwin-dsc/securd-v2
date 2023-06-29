const { Collection } = require("discord.js");

class Cache extends Collection {
    constructor(client) {
        super();
        this.client = client;
    }
    createItem(itemId, guildId, permissions) {
        return this.set(`${itemId}-${guildId}`, new ItemPermissionsManager(this, itemId, guildId, permissions)).get(`${itemId}-${guildId}`);
    }
    getOrCreate(itemId, guildId) {
        return this.has(`${itemId}-${guildId}`) ? this.get(`${itemId}-${guildId}`) : this.createItem(itemId, guildId, []);
    }
    loadTable() {
        require("./model")(this.client);
        this.client.util.loadTable(this, { model: "permission", add: "createItem", key: "id" });
        return this;
    }
}


class ItemPermissionsManager {
    constructor(cache, itemId, guildId, permissions) {
        this.cache = cache;
        this.itemId = itemId;
        this.guildId = guildId;
        this.permissions = permissions;
    }

    has(permission) {
        return this.permissions.includes(permission);
    }
    add(permission) {
        if (!this.has(permission)) this.permissions.push(permission)
        return this;
    }
    addMany(permissions) {
        for (const permission of permissions) {
            if (!this.has(permission)) this.add(permission);
        }
        return this;
    }
    remove(permission) {
        if (this.has(permission)) this.permissions = this.permissions.filter(p => p !== permission);
        return this;
    }
    removeMany(permissions) {
        for (const permission of permissions) {
            if (this.has(permission)) this.remove(permission);
        }
        return this;
    }
    set(permissions) {
        this.permissions = permissions;
        return this;
    }
    all() {
        return this.permissions;
    }

    save() {
        this.cache.client.database.models["permission"].findOne({ where: { id: `${this.itemId}-${this.guildId}` } }).then((data) => {
            if (data) {
                data.update({ permissions: this.permissions }, { where: { id: `${this.itemId}-${this.guildId}` } })
            } else {
                this.cache.client.database.models["permission"].create({ id: `${this.itemId}-${this.guildId}`, permissions: this.permissions })
            }
        });
    }
}

module.exports = Cache;
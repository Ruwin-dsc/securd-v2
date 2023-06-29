const Discord = require("discord.js")
class Util {
    constructor(client) {
        this.client = client

        this.permissions = [
            "createRoles",
            "deleteRoles",
            "updateRoles",
            "addRoles",
            "removeRoles",
            "createChannels",
            "deleteChannels",
            "updateChannels",
            "createWebhooks",
            "deleteWebhooks",
            "updateWebhooks",
            "banMembers",
            "kickMembers",
            "addBot",
            "pings",
            "links",
        ]
        this.dangerousPerms = [
            "Administrator",
            "BanMembers",
            "KickMembers",
            "ManageRoles",
            "ManageChannels",
            "ManageWebhooks",
            "ManageMessages",
            "ManageNicknames",
        ]
    }
    getEmojiId(string) {
        let chars = string.split("");
        let emojiId = "";
        chars.forEach((c) => {
            if (!isNaN(c)) emojiId += c;
        })
        return emojiId;
    }
    memberManageable(member, target, ownerId) {
        if (member.user.id === ownerId) return true;
        if (member.roles.highest.position > target.roles.highest.position) return true;
        return false;
    }
    getChannel(ctx, arg) {
        return ctx.mentions.channels.first() || ctx.guild.channels.cache.get(arg) || ctx.guild.channels.cache.find((c) => c.name.toLowerCase().includes(arg.toLowerCase()))
    }
    getRole(ctx, arg) {
        return ctx.mentions.roles.first() || ctx.guild.roles.cache.get(arg) || ctx.guild.roles.cache.find((r) => r.name.toLowerCase().includes(arg.toLowerCase()))
    }
    roleManageable(member, target, ownerId) {
        if (member.user.id === ownerId) return true;
        if (member.roles.highest.position > target.position) return true;
        return false;
    }
    embedPage(interaction, embeds, ephemeral = false) {
        return require("./embedPage")(interaction, embeds, ephemeral, this);
    }
    replaceInvitesVariables(string, inviter, member, guild, invitesCount) {
        return string.replace("{member}", member)
            .replace("{inviter}", inviter)
            .replace("{inviterName}", inviter.username)
            .replace("{memberName}", member.user.username)
            .replace("{membersCount}", guild.memberCount.toString())
            .replace("{invitesCount}", invitesCount)

    }
    async loadTable(cache, data) {
        await this.client.database.models[data.model].sync({ alter: true });
        for (const element of (await this.client.database.models[data.model].findAll())) {
            if (data.model === "permission") cache[data.add](element.get("id").split("-")[0], element.get("id").split("-")[1], element.get("permissions"))
            else cache[data.add](element[data.key], element.get());
        }
    }
    /**
    * @param {Discord.GuildMember} executorMember
    */
    async punish(guild, executorMember, punish, reason, failLog, sucessLog) {
        let punished = false;
        if (punish === "ban") {
            guild.members.ban(executorMember.user.id, { reason }).then(() => {
                punished = true;
            }).catch((e) => { })
        } else if (punish === "kick") {
            guild.members.kick(executorMember.user.id, { reason }).then(() => {
                punished = true;
            }).catch((e) => { })
        } else if (punish === "derank") {
            executorMember.roles.set(executorMember.roles.cache.filter(r => !r.editable).values(), { reason }).then(() => {
                punished = true;
            }).catch((e) => { })
            if (executorMember.user.bot) {
                executorMember.roles.botRole?.setPermissions([], { reason })
            }
        }
        this.antiraidLog(guild, punished ? sucessLog : failLog);

    }

    antiraidLog(guild, content) {
        const guildManager = this.client.managers.guildManager.getOrCreate(guild.id);
        const config = guildManager.get("antiraid")?.log?.antiraid;
        if (!config) return;
        const channel = guild.channels.cache.get(config);
        let embed = {
            title: "Securd - AntiRaid Logs",
            description: content,
            color: process.env.COLOR
        }
        channel?.send({ embeds: [embed] })
    }
    async sleep(ms) {
        return new Promise(res => setTimeout(res, ms))
    }
}

module.exports = Util;
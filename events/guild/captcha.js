const Canvas = require("canvas");

module.exports = {
    name: "guildMemberAdd",

    async run(client, member) {
        function generateCaptcha() {
            let text = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 5; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
        const guildManager = client.managers.guildManager.getOrCreate(member.guild.id);
        const config = guildManager.get("captcha") || { roles: undefined, toggle: undefined, channel: undefined }
        if (!config.toggle) return;
        const channel = member.guild.channels.cache.get(config.channel);
        if (!channel) return;
        if (member.bot) return;

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage("./images/captcha-background.jpg", { format: "jpg" });
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        let captchaText = generateCaptcha();
        ctx.textAlign = "center";
        ctx.font = "100px sans-serif";
        ctx.fillStyle = "#ffffff";

        ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2 + 20)
        let fake1 = generateCaptcha();
        let fake2 = generateCaptcha();
        let buttons = [
            {type: 2, style: 1, label: fake1, custom_id: fake1},
            {type: 2, style: 1, label: fake2, custom_id: fake2},
            {type: 2, style: 1, label: captchaText, custom_id: captchaText}
        ]
        buttons = buttons.sort(() => Math.random() - 0.5);
        const message = await channel.send({ content: `Welcome to ${member.guild.name}, ${member}! Please verify yourself by clicking the button with the correct text.`, components: [{
            type: 1,
            components: buttons
        }], files: [{ attachment: canvas.toBuffer(), name: "captcha.jpg" }]})
        const collector = message.createMessageComponentCollector({filter: (i) => i.user.id === member.id, time: 300000, max: 1});
        collector.on("collect", async (collected) => {
            if (collected.customId === captchaText) {
                collected.deferUpdate();
                message.delete();
                member.roles.add(config.roles);
            } else {
                collected.deferUpdate();
                message.delete();
                member.kick();
            }
        });
    }
}
require("dotenv").config();
const Securd = require("./structures/Securd");
const Discord = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');


client.on('ready', () => {
 
    new Securd()
})

 
process.on("uncaughtException", (e) => {
        if (e.code === 50013) return;
    console.log(e)
})

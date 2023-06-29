require("dotenv").config();
const Securd = require("./structures/Securd");

 
    new Securd()

 
process.on("uncaughtException", (e) => {
        if (e.code === 50013) return;
    console.log(e)
})

require("dotenv").config();
const bot = new (require("../struct/Badak"))();
bot.start(process.env.token);

import {Client, GuildBasedChannel, GuildChannel, IntentsBitField, Message, PermissionsBitField} from "discord.js";
import * as path from "path";
import {Sequelize} from "sequelize";
import * as fs from "fs";
import {listen_message} from "./listeners/message";
import {
    giveaway_sync,
} from "./giveaway/giveaway";
import cron from "node-cron";
import {get_codes} from "./commands/show-codes/show-codes";


export const PREFIX = "!";
export const CONTROL_GUILD = "859736561830592522";
export const THEME = "#FFFFFF";

//setting up env
require('dotenv')
    .config({
        path: path.join(__dirname, ".env")
    })


//Initializing the bot
const Flags = IntentsBitField.Flags;
const client = new Client({
    intents: [Flags.Guilds, Flags.GuildMembers, Flags.GuildMessages, Flags.MessageContent]
})

//Initializing sequelize for the database
export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "gifts.db",
    logging: false
})

//Syncing all models
const modelDir: string[] = [__dirname, "database", "models"]
fs.readdirSync(path.join(...modelDir))
    .forEach(file => {
        const model = require(path.join(...modelDir, file));
        model.model(sequelize);
    })

sequelize.sync({alter: true}).then(async () => {
    //only login when the models are synced to avoid conflicts
    client.login(process.env._TOKEN);
});




client.once('ready', async (client) => {
    listen_message(client);
    await giveaway_sync(sequelize, client);
    console.log("ready");
})
client.login(process.env._TOKEN);


//a simple function to check if one have perms to run commands
export const check_permission = (msg: Message, cmd: string): boolean => {
    if (!msg.content.startsWith(PREFIX + cmd)) return false;
    if (!msg.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return false;
    if(msg.guildId !== CONTROL_GUILD) return false;
    return true;
}
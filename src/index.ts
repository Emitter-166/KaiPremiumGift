import {Client, GuildBasedChannel, GuildChannel, IntentsBitField, PermissionsBitField} from "discord.js";
import * as path from "path";
import {Sequelize} from "sequelize";
import * as fs from "fs";
import {listen_message} from "./listeners/message";


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
const sequelize = new Sequelize({
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

sequelize.sync({force: true}).then(() => {
    //only login when the models are synced to avoid conflicts
    client.login(process.env._TOKEN);
});




client.once('ready', async (client) => {
    listen_message(client);
    console.log("ready");

})
client.login(process.env._TOKEN);
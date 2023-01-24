import {Client} from "discord.js";
import * as fs from "fs";
import * as path from "path";

export const listen_message = (client: Client) => {
    client.on('messageCreate', async msg => {
        const commands_folder = [path.resolve(__dirname, ".."), "commands"]

        //retrieving every command in commands folder
        fs.readdirSync(path.join(...commands_folder))
            .forEach(command_folder => {

                //finding the correct command handler
                let files = fs.readdirSync(path.join(...commands_folder, command_folder));

                //making sure the folder isn't empty
                if(files.length === 0) return;

                const file_name =  files
                    .reduce((p: string, c: string) => {
                        if (c.endsWith(".js")) {
                            return c
                        }
                        return "";
                    })
                //finally passing in the message
                const cmd = require(path.join(...commands_folder, command_folder, file_name))
                cmd.cmd(msg);
            })
    })
}
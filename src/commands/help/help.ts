import {EmbedBuilder, Message, PermissionsBitField} from "discord.js";
import {PREFIX, THEME} from "../../index";
import * as fs from "fs";
import * as path from "path";


//command handler for help command
export const cmd = async (message: Message) => {
    if (!message.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

    if (!message.content.toLowerCase().startsWith(PREFIX + "help")) return;

    const is_control_guild = message.guildId === "859736561830592522";

    const help_embed = new EmbedBuilder()
        .setTitle("Commands for Kai Premium giveaway")
        .setColor(THEME);

    let description = "";
    const commands_file  = [__dirname, ".."];

    //retrieving all the commands
    const commands = fs.readdirSync(path.resolve(...commands_file));
    commands.forEach(cmd => {
        //retrieving command infos
        const name = cmd;

        let files = fs.readdirSync(path.join(...commands_file, cmd));

        //making sure the folder isn't empty
        if(files.length === 0) return;

        const file_name = files
            .reduce((p: string, c: string) => {
                if(c.endsWith(".js")) return c;
                return "";
            })

        const command_info = require(path.join(...commands_file, cmd, file_name)).config as string

        //making sure all the infos exist
        if (command_info.split("\n").length < 2) return;

        const command_visibility = command_info.split("\n")[1] === "public";
        const command_description = command_info.split("\n")[0];

        if (!command_visibility && is_control_guild) {
            //this is to make sure not to display private commands to other servers
            description += `• ${PREFIX}${name}: ${command_description} \n`
        } else {
            description += `• ${PREFIX}${name}: ${command_description} \n`
        }
    })

    help_embed.setDescription("```" + description + "```");

    await message.reply({
        embeds: [help_embed],
        allowedMentions: {
            repliedUser: false
        }
    })
}

export const config = "view all the commands \n"
    + "public"
import {EmbedBuilder, Message} from "discord.js";
import {check_permission, sequelize} from "../../index";

export const cmd = async (msg: Message) => {
    try{
        if(!check_permission(msg, "show-giveaways")) return;
        const embed = new EmbedBuilder()
            .setDescription(await get_giveaways());
        await msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}})

    }catch (err){
        console.log(`Err on ${__dirname} cmd()`)
        console.log(err)
        msg.react("⛔").catch(err => {
        });
    }
}

export const get_giveaways = async (): Promise<string> => {
    const model = sequelize.model("giveaways");
    const codes = await model.findAll();

    let lines = "";
    for (let code of codes) {
        let serverId = code.get("serverId");
        let threadId = code.get("threadId") ? code.get("threadId") : 'N/A';

        lines += `Server ID: ${serverId}, Thread ID: ${threadId};\n`;
    }
    return "```css\n" + lines + "```";
}


export const config = "View all the running giveaways \n" +
    "private"
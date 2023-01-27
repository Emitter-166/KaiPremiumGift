import {EmbedBuilder, Message} from "discord.js";
import {check_permission, sequelize} from "../../index";

export const cmd = async (message: Message) => {
    try {
        if (!check_permission(message, "show-codes")) return;

        const embed = new EmbedBuilder()
            .setDescription(await get_codes());
        await message.reply({embeds: [embed], allowedMentions: {repliedUser: false}})

    } catch (err) {
        console.log(`Err on ${__dirname} cmd()`)
        console.log(err)
        message.react("⛔").catch(err => {
        });
    }
}


 const get_codes = async (): Promise<string> => {
    const model = sequelize.model("gift_codes");
    const codes = await model.findAll();

    let lines = "";
    for (let code of codes) {
        let usedByUser = code.get("usedByUser") ? code.get("usedByUser") : 'N/A';
        let usedByGuild = code.get("usedByGuild") ? code.get("usedByGuild") : 'N/A';
        let usedAt = code.get("usedAt") ? new Date(code.get("usedAt") as string).toString() : 'N/A';
        let used = code.get("used") as boolean ? 'Yes' : 'No';

        lines += `Code: ${code.get("code")}, Used: ${used}, Used by User: ${usedByUser}, Used by Guild: ${usedByGuild}, Used at: ${usedAt}; \n`;
    }
    return "```css\n" + lines + "```";
}

export const config = "shows all the available codes \n" +
    "private"
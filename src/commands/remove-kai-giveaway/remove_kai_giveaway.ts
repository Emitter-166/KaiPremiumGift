import {Message, PermissionsBitField, ThreadChannel} from "discord.js";
import {check_permission, PREFIX, sequelize} from "../../index";
import {giveaway_create, giveaway_delete} from "../../giveaway/giveaway";

export const cmd = async (message: Message) => {
    try {
        if(!check_permission(message, "remove-kai-giveaway")) return;


        const args = message.content.split(" ");

        //making sure all the arguments exists
        if (args.length !== 2) {
            message.react("⛔").catch(err => {
            });
            return;
        }

        const threadId = args[1];

        let thread;

        try {
            thread = await message.client.channels.fetch(threadId) as ThreadChannel;
            if (thread === undefined) throw new Error();
        } catch (err) {
            console.log(`Err on ${__dirname} cmd() unable to find thread`)
            message.react("⛔").catch(err => {
            });
            return;
        }

        const success = await giveaway_delete(thread.guildId, sequelize);

        if (success) {
            message.react("✅").catch(err => {
            });

        } else {
            message.react("⛔").catch(err => {
            });
        }

    } catch (err) {
        console.log(`Err on ${__dirname} cmd()`)
        console.log(err)
        message.react("⛔").catch(err => {
        });
    }
}

export const config = "remove a kai premium giveaway \n" +
    "private"
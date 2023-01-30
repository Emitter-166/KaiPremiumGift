import {Sequelize} from "sequelize";

import cron from 'node-cron';
import {Client, EmbedBuilder, GuildMember, GuildTextBasedChannel, ThreadChannel, User} from "discord.js";
import {THEME} from "../index";
import path from "path";

require('dotenv')
    .config({
        path: path.join(__dirname, ".env")
    })


export const giveaway_process = async (serverId: string, sequelize: Sequelize, client: Client): Promise<boolean> => {
    try {
        const giveaway = await sequelize.model("giveaways").findOne({
            where: {
                serverId: serverId
            }
        })
        //false = unsuccessful operation
        if (giveaway === null) {
            console.log("No giveaways found for serverId: " + serverId)
            return false;
        }

        const threadId = giveaway.get("threadId") as string
        const winner = await giveaway_pick_winner(serverId, client);
        let premium = await giveaway_pick_code(sequelize, true, winner.id, serverId);

        if (premium.code === "none") {
            console.log("Not enough codes available to run this giveaway! serverId: " + serverId)
            await send_log("No kai premium codes available", "ㅤ", client);
            //err
            return false;
        }

        const code = premium.code;

        if (!await send_log("Kai premium winner", "" +
            "**winner: <@" + winner.id + "> \n" +
            "server: " + (await client.guilds.fetch(serverId)).name + "\n" +
            "code: " + code + "\n" +
            "available: " + premium.available + " codes**", client)) return false;

        if (!await send_thread(threadId, client, "Magic Kai winner!", `<@${winner.id}> you just won Magic Kai for a week! 💫 🥳`, winner.id)) return false;
        await send_dm(winner.user, "It's your lucky day!", "" +
            `You just won Magic Kai for a week, and we hope you have the best time seeing all that Magic Kai can do. Your special code is ||\\"${code}\\"||. Please DM <@907606359405633536> **"I want to redeem my gift"** and send her your code. :slight_smile:`)
        return true;
    } catch (err) {
        console.log("Err on giveaway_process()")
        console.log(err);
        return false;
    }
}


const giveaway_pick_winner = async (serverId: string, client: Client): Promise<GuildMember> => {
    const guild = await client.guilds.fetch(serverId);
    const members = await guild.members.fetch();

    let winner: GuildMember | undefined;
    do {
        do {
            winner = members.at(Math.floor(Math.random() * members.size));
        } while (winner?.user.bot)
    } while (!winner)

    return winner;
}

const send_dm = async (user: User, title: string, message: string): Promise<boolean> => {
    try {
        const dm = await user.createDM()
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(THEME);
        await dm.send({embeds: [embed], content: `<@${user.id}>`});
        //success
        return true;
    } catch (err) {

        console.log(`Couldn't DM ${user.username}#${user.discriminator}`);
        //err
        return false;
    }
}

const send_log = async (title: string, description: string, client: Client): Promise<boolean> => {
    let logChannelId;
    try {
        const embed = new EmbedBuilder()
            .setColor(THEME)
            .setTitle(title)
            .setDescription(description);

        logChannelId = process.env._LOG_CHANNEL;
        if (!logChannelId) return false; //err

        const channel = await client.channels.fetch(logChannelId) as GuildTextBasedChannel;
        if (channel === null) return false; //err

        //role mention
        const role = process.env._LOG_ROLE;
        let mention = "kai premium winner";
        if (role) {
            mention = `<@&${role}>`;
        }

        await channel.send({embeds: [embed], content: mention});
        return true;
    } catch (err) {
        if (!logChannelId) logChannelId = "";
        console.log(`Couldn't log channelId: ${logChannelId}`)
        return false;
    }
}

const send_thread = async (threadId: string, client: Client, title: string, message: string, userId: string): Promise<boolean> => {
    try {
        let channel = await client.channels.fetch(threadId)

        //checking if it's a thread channel
        if (channel === null) return false;
        if (!channel?.isThread) return false;

        const thread = channel as ThreadChannel;

        const embed = new EmbedBuilder()
            .setColor(THEME)
            .setTitle(title)
            .setDescription(message);

        await thread.send({embeds: [embed], content: `<@${userId}>`});
        return true;
    } catch (err) {
        console.log(`Couldn't send message on ${threadId}`)
        return false;
    }
}

export const giveaway_sync = async (sequelize: Sequelize, client: Client) => {
    try {
        const giveaways = await sequelize.model("giveaways").findAll();

        for (let giveaway of giveaways) {
            const server_id = giveaway.get("serverId") as string;

            //making sure there is no giveaway task for that server

            const previous_task = cron.getTasks().get(server_id);
            if (previous_task) cron.getTasks().get(server_id)?.stop();

            //scheduling the function to run every day at 00:00
            cron.schedule("0 0 0 * * *", () => {
                giveaway_process(server_id, sequelize, client);
            }, {name: server_id})
        }
    } catch (err) {
        console.log("Err on giveaway_sync()");
        console.log(err)

    }
}

const giveaway_pick_code = async (sequelize: Sequelize, deduct: boolean, userId?: string, serverId?: string): Promise<{ code: string, available: number }> => {
    try {
        const codes = await sequelize.model("gift_codes").findAll({
            where: {
                used: false
            }
        })
        //if there are no available codes, we will return this
        if (codes.length === 0) {
            return {
                code: "none",
                available: 0
            }
        }

        const code = codes.at(0);

        //making sure the model is valid
        if (code === undefined) {
            return {
                code: "none",
                available: 0
            }
        }

        //marking the code as used
        if (deduct) {
            await code.update({
                used: true,
                usedByUser: userId,
                usedByGuild: serverId,
                usedAt: Date.now()
            })
        }
        return {
            code: code.get("code") as string,
            available: codes.length - 1
        }
    } catch (err) {
        console.log("Err on giveaway_pick_code()");
        console.log(err)
        return {
            code: "none",
            available: 0
        }
    }

}

export const giveaway_create = async (serverId: string, threadId: string, sequelize: Sequelize, client: Client): Promise<boolean> => {
    try {
        const giveaways = await sequelize.model("giveaways");

        const [giveaway, created] = await giveaways.findOrCreate({
            where: {
                serverId: serverId
            },
            defaults: {
                threadId: threadId
            }
        })

        //making sure only one giveaway runs at a time
        if (created) {
            cron.schedule("0 0 0 * * *", () => {
                giveaway_process(serverId, sequelize, client);
            }, {name: serverId})
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log("Err on giveaway_create()");
        console.log(err);
        return false;
    }
}

export const giveaway_delete = async (serverId: string, sequelize: Sequelize) => {
    try {
        const giveaways = await sequelize.model("giveaways");

        const giveaway = await giveaways.findOne({
            where: {
                serverId: serverId
            }
        })

        //making sure the giveaway exists
        if (giveaway !== null) {
            //deleting from database
            await giveaway.destroy()

            //removing the process
            cron.getTasks().get(serverId)?.stop();

            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log("Error on giveaway_delete()")
        console.log(err)
        return false;
    }
}
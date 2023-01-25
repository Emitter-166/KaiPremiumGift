import {Sequelize} from "sequelize";

import cron from 'node-cron';


export const giveaway_process = (serverId: string, sequelize: Sequelize) => {

}

export const giveaway_sync = async (sequelize: Sequelize) => {
    const giveaways = await sequelize.model("giveaways").findAll();

    for(let giveaway of giveaways){
            const server_id = giveaway.get("serverId") as string;

            //making sure there is no giveaway task for that server

            const previous_task = cron.getTasks().get(server_id);
            if(previous_task) cron.getTasks().get(server_id)?.stop();

            //scheduling the function to run every day at 00:00
            cron.schedule("0 0 0 * * *", () => {
                giveaway_process(server_id, sequelize);
            }, {name: server_id})
    }

}

export const giveaway_create = async (serverId: string, channelId: string, threadId: string, messageId: string, sequelize: Sequelize): Promise<boolean> => {
    const giveaways =  await sequelize.model("giveaways");

    const [giveaway, created] = await giveaways.findOrCreate({
        where: {
            serverId: serverId
        },
        defaults:{
            channelId: channelId,
            messageId: messageId,
            threadId: threadId
        }
    })

    //making sure only one giveaway runs at a time
    if(created){
        cron.schedule("0 0 0 * * *", () => {
            giveaway_process(serverId, sequelize);
        }, {name: serverId})
        return true;
    }else{
        return false;
    }

}

export const giveaway_delete = async (serverId: string, sequelize: Sequelize) => {
    const giveaways =  await sequelize.model("giveaways");

    const giveaway = await giveaways.findOne({
        where: {
            serverId: serverId
        }
    })

    //making sure the giveaway exists
    if(giveaway !== null){
        //deleting from database
        await giveaway.destroy()

        //removing the process
        cron.getTasks().get(serverId)?.stop();

        return true;
    }else{
        return false;
    }
}
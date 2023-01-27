import {Message, PermissionsBitField} from "discord.js";
import {check_permission, PREFIX, sequelize} from "../../index";

export const cmd = async (message: Message) => {
    try{
        if(!check_permission(message, "add-code")) return;

        const args = message.content.split(" ");

        //no codes provided
        if(args.length === 1) {
            message.react("⛔").catch(err => {});
            return;
        }

        let i = 0;
        let codes:{code: string}[] = [];
        for(let code of args){
            //making sure we don't include the command as one of the codes
            i++;
            if(i !== 1){
                codes.push({code: code});
            }
        }

        const model = sequelize.model("gift_codes");

        await sequelize.transaction(async t => {
            try{
                await model.bulkCreate(codes, {transaction: t});
                message.react("✅").catch(err => {});
            }catch (err){
                console.log("Err on commands/add-code/add_code.ts/cmd() on transaction")
                console.log(err)
                message.react("⛔").catch(err => {});
            }
        })
    }catch (err){
        console.log(`Err on ${__dirname} cmd()`)
        console.log(err)
        message.react("⛔").catch(err => {
        });
    }
}



export const config = "Refill kai premium codes \n" +
    "private"
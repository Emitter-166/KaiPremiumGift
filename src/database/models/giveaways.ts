import {BOOLEAN, CHAR, INTEGER, Sequelize} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("giveaways", {
        serverId: {
            type: CHAR(50),
            allowNull: false
        },
        channelId: {
            type: CHAR(50),
            allowNull: false
        },
        messageId: {
            type: CHAR(50),
            allowNull: false
        },

    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['serverId'],
                unique: true
            }
        ]
    })
}
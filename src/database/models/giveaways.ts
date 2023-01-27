import {BOOLEAN, CHAR, INTEGER, Sequelize} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("giveaways", {
        serverId: {
            type: CHAR(50),
            allowNull: false
        },
        threadId: {
            type: CHAR(50),
            allowNull: true
        }
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
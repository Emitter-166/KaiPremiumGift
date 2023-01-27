import {BOOLEAN, CHAR, INTEGER, Sequelize} from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define("gift_codes", {
        code: {
            type: CHAR(255),
            allowNull: false
        },
        used: {
            type: BOOLEAN,
            defaultValue: false
        },
        usedByUser: {
            type: CHAR(50)
        },
        usedByGuild: {
            type: CHAR(50)
        },
        usedAt: {
            type: INTEGER
        }
    }, {
        timestamps: false,
        indexes: [
            {
                fields: ['code'],
                unique: true
            }
        ]
    })
}
const {DataTypes} = require('sequelize');

module.exports = (client) => {
    client.database.define("permission", {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
        },
        permissions: {
            type: DataTypes.JSON(),
            defaultValue: [],
            primaryKey: false,
        },
    })
}
const { DataTypes } = require("sequelize");

module.exports = (client) => {
  client.database.define("guild", {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    crowns: {
      type: DataTypes.JSON(),
      defaultValue: [],
      allowNull: true
    },
    antiraid: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    automod: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    captcha: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    autorole: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    ticket: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    badwordsConfig: {
      allowNull: true,
      type: DataTypes.JSON(),
      defaultValue: {},
    },
    ghostpings: {
      allowNull: true,
      type: DataTypes.JSON(),
      defaultValue: []
    },
    tempvoc: {
      allowNull: true,
      type: DataTypes.JSON(),
      defaultValue: {},
    },
    soutien: {
      type: DataTypes.JSON(),
      defaultValue: {},
      allowNull: true
    },
    counters: {
      allowNull: true,
      type: DataTypes.JSON(),
      defaultValue: {},
    }
  })
}
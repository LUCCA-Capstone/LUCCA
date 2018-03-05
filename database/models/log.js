'use strict';
module.exports = (sequelize, DataTypes) => {
  var log = sequelize.define('log', {
    id:
      {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    eventClass:
      {
        type: DataTypes.STRING,
        allowNull: false
      },
    entity:
      {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "n/a"
      },
    event:
      {
        type: DataTypes.STRING(4096),
        defaultValue: null
      },
    eventDate:
      {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('now')
      },
  }, {timestamps: false});
  return log;
};

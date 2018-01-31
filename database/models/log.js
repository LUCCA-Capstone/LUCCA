'use strict';
module.exports = (sequelize, DataTypes) => {
  var log = sequelize.define('log', {
      Id:
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
      event:
          {
              type: DataTypes.STRING,
              defaultValue: null
          },
      createdAt:
          {
              type: DataTypes.DATE,
              allowNull: false
          }
  });

  return log;
};
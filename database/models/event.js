'use strict';
module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    id:
        {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
    eventClass:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    eventText:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    eventTime:
        {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('now')
        }
  });

  Event.associate = (models) => {
      //add associations
    };

  return Event;
};

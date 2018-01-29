'use strict';
module.exports = (sequelize, DataTypes) => {
  var Record = sequelize.define('Record', {
    mId:
          {
              type: DataTypes.DATE,
              allowNull: false
          },
    sId:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
    date:
        {
            type: DataTypes.DATE,
            allowNull: false
        },
    startTime:
        {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
    endTime:
        {
            type: DataTypes.STRING,
            allowNull: false
        }
  });

  Record.associate = (models) => {
        //add associations
        Record.belongsTo(models.User, {
           foreignKey: 'badge'
        });
    };
  return Record;
};
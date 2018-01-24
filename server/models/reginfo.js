'use strict';
module.exports = (sequelize, DataTypes) => {
  var RegInfo = sequelize.define('RegInfo', {
    email:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    signature:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    association:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    date:
        {
            type: DataTypes.DATE,
            allowNull: false
        },
    phone:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    ecName:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    ecRelation:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    ecPhone:
        {
            type: DataTypes.STRING,
            allowNull: false
        }
  });

  RegInfo.associate = (models) => {
        //add associations
        RegInfo.hasMany(models.Record, {
           foreignKey: 'email'
        });

        RegInfo.belongsTo(models.User, {
           foreignKey: 'badge',
           onDelete: 'CASCADE'
        });
    };

  return RegInfo;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    badge:
        {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
    firstName:
        {
          type: DataTypes.STRING,
          allowNull: false
        },
    lastName:
        {
          type: DataTypes.STRING,
          allowNull: false
        },
    status:
        {
          type: DataTypes.STRING,
          allowNull: false
        }
  });

  User.associate = (models) => {
      //add associations
      User.hasMany(models.RegInfo,{
         foreignKey: 'badge',
         onDelete: 'CASCADE'
      });

      User.hasMany(models.Accounts, {
          foreignKey: 'badge',
          onDelete: 'CASCADE'
      });

        User.hasMany(models.Access, {
            foreignKey: 'badge',
            onDelete: 'CASCADE'
        });

        User.hasMany(models.Record, {
           foreignKey: 'badge'
        });
    };

  return User;
};
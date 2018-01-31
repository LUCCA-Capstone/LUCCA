'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
      badge:
          {
              type: DataTypes.STRING,
              primaryKey: true,
              allowNull: false
          },
      first:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      last:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      email:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      phone:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      signature:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      ecSignature:
          {
              type: DataTypes.STRING,
              defaultValue: false
          },
      ecName:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      ecRel:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      ecPhone:
          {
              type: DataTypes.STRING,
              allowNull: false
          },
      status:
          {
              type: DataTypes.STRING,
              defaultValue: 'User',
              allowNull: false
          },
      confirmation:
          {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
      password:
          {
              type: DataTypes.STRING,
              defaultValue: null
          },
      mailingList:
          {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
      createdAt:
          {
              type: DataTypes.DATE,
              allowNull: false
          },
      updatedAt:
          {
              type: DataTypes.DATE,
              allowNull: false
          }
  });

    user.associate = (models) => {
        //add associations
        user.hasMany(models.privileges, {
            foreignKey: 'badge',
            onDelete: 'CASCADE'
        });
    };

  return user;
};
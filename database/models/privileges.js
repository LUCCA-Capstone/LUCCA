'use strict';
module.exports = (sequelize, DataTypes) => {
  var privileges = sequelize.define('privileges', {
    id:
      {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
    badge:
      {
        type: DataTypes.STRING,
        allowNull: false
      },
    sId:
      {
        type: DataTypes.STRING,
        allowNull: false
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

  privileges.associate = (models) => {
    //add associations
    privileges.belongsTo(models.user, {
      foreignKey: 'badge',
      onDelete: 'CASCADE'
    });

    privileges.belongsTo(models.machine, {
      foreignKey: 'sId',
      onDelete: 'CASCADE'
    });
  };


  return privileges;
};
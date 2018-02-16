'use strict';
module.exports = (sequelize, DataTypes) => {
  var machine = sequelize.define('machine', {
    sId:
      {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
    name:
      {
        type: DataTypes.STRING,
        allowNull: false
      },
    description:
      {
        type: DataTypes.STRING,
        defaultValue: null
      },
    registered:
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
      },
    certCN:
      {
        type: DataTypes.STRING(4096),
        allowNull: false
      }
  });

  machine.associate = (models) => {
    //add associations
    machine.hasMany(models.privileges, {
      foreignKey: 'sId',
      onDelete: 'CASCADE'
    });
  };

  return machine;
};

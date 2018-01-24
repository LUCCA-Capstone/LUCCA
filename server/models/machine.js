'use strict';
module.exports = (sequelize, DataTypes) => {
  var Machine = sequelize.define('Machine', {
    mId:
        {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
    sId:
        {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
    mDescription:
        {
            type: DataTypes.STRING
        },
    status:
        {
            type: DataTypes.STRING,
            allowNull: false
        }
  });

  Machine.associate = (models) => {
        //add associations
    };
  return Machine;
};
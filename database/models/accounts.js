'use strict';
module.exports = (sequelize, DataTypes) => {
  var Accounts = sequelize.define('Accounts', {
    password:
        {
            type: DataTypes.STRING,
            allowNull: false
        },
    email:
        {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }
  });

  Accounts.associate = (models) => {
        //add associations
        Accounts.belongsTo(models.User, {
          foreignKey: 'badge',
          onDelete: 'CASCADE'
        });
    };
  return Accounts;
};
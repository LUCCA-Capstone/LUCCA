'use strict';
module.exports = (sequelize, DataTypes) => {
  var Access = sequelize.define('Access', {
    sId:
        {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
    trained:
        {
            type: DataTypes.BOOLEAN
        }
  });

  Access.associate = (models) => {
        //add associations
        Access.belongsTo(models.User, {
          foreignKey: 'badge',
          onDelete: 'CASCADE'
        });
    };
  return Access;
};
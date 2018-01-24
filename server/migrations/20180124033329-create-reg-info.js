'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RegInfos', {
      badge: {
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'badge'
        }
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      signature: {
        allowNull: false,
        type: Sequelize.STRING
      },
      association: {
        allowNull: false,
        type: Sequelize.STRING
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecRelation: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecPhone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('RegInfos');
  }
};
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Records', {
      badge: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
            model: 'Users',
            key: 'badge'
        }
      },
      sId: {
            allowNull: false,
            type: Sequelize.DATE
        },
      mId: {
            allowNull: false,
            type: Sequelize.STRING
        },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      startTime: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      endTime: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Records');
  }
};
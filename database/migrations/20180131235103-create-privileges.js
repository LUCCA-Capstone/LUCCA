'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('privileges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      badge: {
        allowNull: false,
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        references:
            {
              model: 'users',
              key: 'badge'
            }
      },
      sId: {
        allowNull: false,
        type: Sequelize.STRING,
        onDelete: 'CASCADE',
        references:
            {
                model: 'machines',
                key: 'sId'
            }
      },
      trained: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('privileges');
  }
};
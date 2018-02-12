'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('logs', {
      Id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventClass: {
        allowNull: false,
        type: Sequelize.STRING
      },
      event: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    }, {timestamps:false});
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('logs');
  }
};
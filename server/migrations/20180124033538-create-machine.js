'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Machines', {
      sId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      mId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      mDescription: {
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Machines');
  }
};
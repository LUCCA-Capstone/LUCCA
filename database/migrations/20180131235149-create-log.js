'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('logs', {
      id: {
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
        type: Sequelize.STRING(4096)
      },
      eventDate: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
    }, {timestamps:false});
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('logs');
  }
};

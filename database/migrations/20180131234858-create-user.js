'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      badge: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      first: {
        allowNull: false,
        type: Sequelize.STRING
      },
      last: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
          allowNull: false,
          type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      signature: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecSignature: {
        defaultValue: null,
        type: Sequelize.STRING
      },
      ecName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecRel: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ecPhone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
          allowNull: false,
          defaultValue: 'User',
          type: Sequelize.STRING
        },
      confirmation: {
          defualtValue: false,
          type: Sequelize.BOOLEAN
      },
      password: {
        defaultValue: null,
        type: Sequelize.STRING
      },
      mailingList: {
       defaultValue: false,
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
    return queryInterface.dropTable('users');
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('privileges', [{
        badge: '8910111',
        sId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        badge: '8910111',
        sId: '3',
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        badge: '8910111',
        sId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
    },{
      badge: '1234567',
      sId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
      {
        badge: '1234567',
        sId: '3',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};

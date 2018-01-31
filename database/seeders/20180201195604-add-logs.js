'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*return queryInterface.bulkInsert('logs', [{
        eventType: 'New User',
        event: 'Blah Blab Blah...',
        createdAt: new Date(),
    },{
        eventType: 'Remove Machine',
        event: 'Bleep Bloop Blop...',
        createdAt: new Date(),
    },{
        eventType: 'Grant Privileges',
        event: 'Zoom Zam Zee',
        createdAt: new Date(),
    }], {});*/
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

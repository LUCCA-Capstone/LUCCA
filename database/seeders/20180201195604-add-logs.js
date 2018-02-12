'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('logs', [{
        eventClass: 'New User',
        event: 'Blah Blab Blah...',
        createdAt: new Date(),
    },{
        eventClass: 'Remove Machine',
        event: 'Bleep Bloop Blop...',
        createdAt: new Date(),
    },{
        eventClass: 'Grant Privileges',
        event: 'Zoom Zam Zee',
        createdAt: new Date(),
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

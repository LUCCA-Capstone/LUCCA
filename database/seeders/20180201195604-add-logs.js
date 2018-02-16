'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('logs', [{
        eventClass: 'New User',
        event: 'Blah Blab Blah...',
    },{
        eventClass: 'Remove Machine',
        event: 'Bleep Bloop Blop...',
    },{
        eventClass: 'Grant Privileges',
        event: 'Zoom Zam Zee',
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

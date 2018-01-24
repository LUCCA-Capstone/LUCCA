'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*return queryInterface.bulkInsert('Users',[
        {
            badge: '123',
            firstName: 'Test',
            lastName: 'Primary Key',
            status: 'Manager',
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});*/
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
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

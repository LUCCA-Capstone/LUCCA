'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*return queryInterface.bulkInsert('machines', [{
        sId: '1',
        name: 'Hacksaw',
        description: 'For Cutting Stuff',
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        sId: '2',
        name: '3d Printer',
        //description: 'Guy',
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        sId: '3',
        name: 'Cannon',
        description: 'Things go Boom!',
        createdAt: new Date(),
        updatedAt: new Date()
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

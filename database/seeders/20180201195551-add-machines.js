'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('machines', [{
        sId: '1',
        name: 'Hacksaw',
        description: 'For Cutting Stuff',
        registered: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        sId: '2',
        name: '3d Printer',
        //description: 'Guy',
        registered: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        sId: '3',
        name: 'Cannon',
        description: 'Things go Boom!',
        registered: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },{
      sId: '4',
      name: 'Hacksaw II',
      description: 'For Cutting Stuff Harder',
      registered: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      sId: '5',
      name: '8d Printer',
      //description: 'Guy',
      registered: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      sId: '6',
      name: 'WOOOOOO',
      description: 'Things go Boom!',
      registered: true,
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

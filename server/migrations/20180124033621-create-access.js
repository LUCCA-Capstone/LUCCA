'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Accesses', {
        badge: {
            allowNull: false,
            type: Sequelize.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Users',
                key: 'badge'
            }
        },
        sId: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.STRING
        },
        trained: {
            type: Sequelize.BOOLEAN
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });
},
down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Accesses');
}
};
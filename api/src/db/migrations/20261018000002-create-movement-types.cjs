'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movement_types', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      label: { type: Sequelize.STRING(100), allowNull: false },
      is_negative: { type: Sequelize.BOOLEAN, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movement_types');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cards', key: 'id' },
        onDelete: 'RESTRICT',
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'movement_types', key: 'id' },
        onDelete: 'RESTRICT',
      },
      counterparty: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      occurred_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.addConstraint('movements', {
      type: 'check',
      fields: ['amount'],
      where: { amount: { [Sequelize.Op.gt]: 0 } },
      name: 'movements_amount_check',
    });

    await queryInterface.addIndex('movements', ['card_id', 'occurred_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('movements');
  },
};

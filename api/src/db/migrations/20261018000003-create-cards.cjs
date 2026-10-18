'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cards', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
      },
      holder_name: { type: Sequelize.STRING(100), allowNull: false },
      // Sequelize crea el tipo enum "enum_cards_brand" en Postgres.
      brand: { type: Sequelize.ENUM('MASTERCARD', 'VISA'), allowNull: false },
      last4: { type: Sequelize.CHAR(4), allowNull: false },
      exp_month: { type: Sequelize.SMALLINT, allowNull: false },
      exp_year: { type: Sequelize.SMALLINT, allowNull: false },
      currency: { type: Sequelize.CHAR(3), allowNull: false },
      balance: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });

    await queryInterface.addConstraint('cards', {
      type: 'check',
      fields: ['exp_month'],
      where: { exp_month: { [Sequelize.Op.between]: [1, 12] } },
      name: 'cards_exp_month_check',
    });

    await queryInterface.addIndex('cards', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cards');
    // dropTable no borra el tipo enum: hay que hacerlo a mano.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cards_brand";');
  },
};

'use strict';

const bcrypt = require('bcrypt');

// [counterparty, code del tipo, monto, fecha, descripción opcional]
const GRANATE_MOVEMENTS = [
  ['Adobe', 'SUBSCRIPTION', '125.00', '2026-10-17T10:15:00-03:00', 'Creative Cloud, plan mensual'],
  ['Ronaldo', 'CASH_IN', '95.00', '2026-10-16T18:40:00-03:00'],
  ['Figma', 'SUBSCRIPTION', '125.00', '2026-10-15T09:00:00-03:00', 'Plan Professional'],
  ['Juan Perez', 'CASH_OUT', '95.00', '2026-10-14T21:05:00-03:00', 'Entradas para el partido'],
  ['José Suárez', 'CASH_IN', '95.00', '2026-10-12T13:20:00-03:00'],
  ['Juan Rodríguez', 'CASH_OUT', '95.00', '2026-10-10T20:30:00-03:00'],
  ['Julio César', 'CASH_IN', '95.00', '2026-10-08T11:45:00-03:00', 'Devolución del asado'],
  ['Mariano Martinez', 'CASH_OUT', '95.00', '2026-10-06T16:10:00-03:00'],
  ['Spotify', 'SUBSCRIPTION', '10.99', '2026-10-05T08:00:00-03:00'],
  ['Netflix', 'SUBSCRIPTION', '15.49', '2026-10-03T08:00:00-03:00'],
  ['Sofía Gómez', 'CASH_IN', '120.00', '2026-09-28T19:00:00-03:00'],
  ['Lucía Fernández', 'CASH_OUT', '38.19', '2026-09-25T12:30:00-03:00', 'Cena'],
  ['Adobe', 'SUBSCRIPTION', '125.00', '2026-09-17T10:15:00-03:00', 'Creative Cloud, plan mensual'],
  ['Figma', 'SUBSCRIPTION', '125.00', '2026-09-15T09:00:00-03:00', 'Plan Professional'],
  ['Ronaldo', 'CASH_IN', '60.00', '2026-09-12T17:25:00-03:00'],
  ['Martín López', 'CASH_OUT', '80.00', '2026-09-10T22:00:00-03:00'],
  ['Spotify', 'SUBSCRIPTION', '10.99', '2026-09-05T08:00:00-03:00'],
  ['Netflix', 'SUBSCRIPTION', '15.49', '2026-09-03T08:00:00-03:00'],
  ['Club Atlético Lanús', 'SUBSCRIPTION', '30.00', '2026-09-02T10:00:00-03:00', 'Cuota social de septiembre'],
  ['Carga inicial', 'CASH_IN', '1500.00', '2026-09-01T09:00:00-03:00', 'Primera carga de la tarjeta'],
];

// Segunda tarjeta del usuario del challenge (Visa), con sus propios movimientos.
const GRANATE_VISA_MOVEMENTS = [
  ['Tomás Díaz', 'CASH_OUT', '60.00', '2026-10-18T21:30:00-03:00', 'Pizza del sábado'],
  ['Disney+', 'SUBSCRIPTION', '13.99', '2026-10-11T08:00:00-03:00'],
  ['Camila Ruiz', 'CASH_IN', '70.00', '2026-10-09T15:10:00-03:00', 'Parte del regalo'],
  ['YouTube Premium', 'SUBSCRIPTION', '11.99', '2026-10-04T08:00:00-03:00'],
  ['Diego Torres', 'CASH_OUT', '45.00', '2026-09-27T19:45:00-03:00'],
  ['Carga inicial', 'CASH_IN', '400.00', '2026-09-20T09:00:00-03:00', 'Primera carga de la tarjeta'],
];

// Segundo usuario: sirve para probar que no se puede ver un movimiento ajeno.
const OTHER_MOVEMENTS = [
  ['Carga inicial', 'CASH_IN', '200.00', '2026-10-01T09:00:00-03:00'],
  ['Netflix', 'SUBSCRIPTION', '15.49', '2026-10-03T08:00:00-03:00'],
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const types = await queryInterface.bulkInsert(
      'movement_types',
      [
        { code: 'SUBSCRIPTION', label: 'Pago de suscripción', is_negative: true },
        { code: 'CASH_IN', label: 'Pago recibido', is_negative: false },
        { code: 'CASH_OUT', label: 'Pago enviado', is_negative: true },
      ],
      { returning: true },
    );
    const typeByCode = Object.fromEntries(types.map((t) => [t.code, t]));

    const [granate, other] = await queryInterface.bulkInsert(
      'users',
      [
        {
          email: 'soygranate@clublanus.com',
          password_hash: await bcrypt.hash('GRANATE1@', 10),
          name: 'Granate',
          last_name: 'Lanús',
        },
        {
          email: 'otro@clublanus.com',
          password_hash: await bcrypt.hash('OTRO1234@', 10),
          name: 'Otro',
          last_name: 'Usuario',
        },
      ],
      { returning: true },
    );

    // La Visa va al final para no cambiar los ids de las tarjetas ya existentes.
    const cards = [
      { user: granate, holderName: 'Soy Granate', brand: 'MASTERCARD', last4: '1234', expMonth: 2, expYear: 2030, movements: GRANATE_MOVEMENTS },
      { user: other, holderName: 'Otro Usuario', brand: 'VISA', last4: '5678', expMonth: 2, expYear: 2030, movements: OTHER_MOVEMENTS },
      { user: granate, holderName: 'Soy Granate', brand: 'VISA', last4: '4821', expMonth: 8, expYear: 2029, movements: GRANATE_VISA_MOVEMENTS },
    ];

    for (const card of cards) {
      // El saldo se calcula a partir de los movimientos, en centavos (enteros)
      // para no sumar decimales con float.
      let balanceCents = 0;
      for (const [, code, amount] of card.movements) {
        const cents = Math.round(Number(amount) * 100);
        balanceCents += typeByCode[code].is_negative ? -cents : cents;
      }

      const [createdCard] = await queryInterface.bulkInsert(
        'cards',
        [
          {
            user_id: card.user.id,
            holder_name: card.holderName,
            brand: card.brand,
            last4: card.last4,
            exp_month: card.expMonth,
            exp_year: card.expYear,
            currency: 'USD',
            balance: (balanceCents / 100).toFixed(2),
          },
        ],
        { returning: true },
      );

      await queryInterface.bulkInsert(
        'movements',
        card.movements.map(([counterparty, code, amount, occurredAt, description]) => ({
          card_id: createdCard.id,
          type_id: typeByCode[code].id,
          counterparty,
          description: description ?? null,
          amount,
          occurred_at: new Date(occurredAt),
        })),
      );
    }
  },

  async down(queryInterface) {
    // RESTART IDENTITY reinicia los ids: al volver a sembrar, los ids son los mismos.
    await queryInterface.sequelize.query(
      'TRUNCATE movements, cards, movement_types, users RESTART IDENTITY;',
    );
  },
};

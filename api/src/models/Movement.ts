import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../db.js';
import type { Card } from './Card.js';
import type { MovementType } from './MovementType.js';

export class Movement extends Model<InferAttributes<Movement>, InferCreationAttributes<Movement>> {
  declare id: CreationOptional<number>;
  declare cardId: ForeignKey<Card['id']>;
  declare typeId: ForeignKey<MovementType['id']>;
  declare counterparty: string;
  declare description: string | null;
  // DECIMAL llega como string desde Postgres para no perder precisión.
  declare amount: string;
  declare occurredAt: Date;

  // Se completan cuando la consulta usa include.
  declare type?: NonAttribute<MovementType>;
  declare card?: NonAttribute<Card>;
}

Movement.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    counterparty: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    occurredAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'movements', underscored: true },
);

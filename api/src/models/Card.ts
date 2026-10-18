import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db.js';
import type { User } from './User.js';

export class Card extends Model<InferAttributes<Card>, InferCreationAttributes<Card>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare holderName: string;
  declare brand: 'MASTERCARD' | 'VISA';
  declare last4: string;
  declare expMonth: number;
  declare expYear: number;
  declare currency: string;
  // DECIMAL llega como string desde Postgres para no perder precisión.
  declare balance: CreationOptional<string>;
}

Card.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    holderName: { type: DataTypes.STRING(100), allowNull: false },
    brand: { type: DataTypes.ENUM('MASTERCARD', 'VISA'), allowNull: false },
    last4: { type: DataTypes.CHAR(4), allowNull: false },
    expMonth: { type: DataTypes.SMALLINT, allowNull: false },
    expYear: { type: DataTypes.SMALLINT, allowNull: false },
    currency: { type: DataTypes.CHAR(3), allowNull: false },
    balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'cards', underscored: true },
);

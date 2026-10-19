import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../db.js';
import type { Card } from './Card.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare lastName: string;

  // Se completa cuando la consulta usa include.
  declare cards?: NonAttribute<Card[]>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
  },
  { sequelize, tableName: 'users', underscored: true },
);

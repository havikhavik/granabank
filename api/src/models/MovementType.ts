import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db.js';

export class MovementType extends Model<InferAttributes<MovementType>, InferCreationAttributes<MovementType>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare label: string;
  declare isNegative: boolean;
}

MovementType.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    label: { type: DataTypes.STRING(100), allowNull: false },
    isNegative: { type: DataTypes.BOOLEAN, allowNull: false },
  },
  // La tabla no tiene created_at ni updated_at: es un catálogo.
  { sequelize, tableName: 'movement_types', underscored: true, timestamps: false },
);

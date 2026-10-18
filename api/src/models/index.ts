import { Card } from './Card.js';
import { Movement } from './Movement.js';
import { MovementType } from './MovementType.js';
import { User } from './User.js';

// Asociaciones. La clave foránea siempre va del lado "muchos".
User.hasMany(Card, { foreignKey: 'userId', as: 'cards' });
Card.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Card.hasMany(Movement, { foreignKey: 'cardId', as: 'movements' });
Movement.belongsTo(Card, { foreignKey: 'cardId', as: 'card' });

MovementType.hasMany(Movement, { foreignKey: 'typeId', as: 'movements' });
Movement.belongsTo(MovementType, { foreignKey: 'typeId', as: 'type' });

export { Card, Movement, MovementType, User };

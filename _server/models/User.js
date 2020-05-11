/* eslint-disable object-shorthand */
import uuid from 'uuidv4';
import Sequelize from 'sequelize';
import sqlz from './sequelize';

const User = sqlz.define(
  'user',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => uuid(),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: { type: Sequelize.STRING },
    role: { type: Sequelize.INTEGER, defaultValue: 0 }
  }
);

export default User;

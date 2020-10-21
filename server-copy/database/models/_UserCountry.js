/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import User from './_User';

const UserCountry = sqlz.define(
  'user_country',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firebase_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    country: {
      type: Sequelize.STRING,
    },
    user: {
      type: Sequelize.STRING,
      references: {
        model: User,
        key: 'email_hash'
      }
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }
);

export default UserCountry;

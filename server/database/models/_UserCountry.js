/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import User from './_User';
import Country from './_Country';

const UserCountry = sqlz.define(
  'user_country',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    country: {
      type: Sequelize.INTEGER,
      references: {
        model: Country,
        key: 'id'
      }
    },
    user: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
  }
);

export default UserCountry;

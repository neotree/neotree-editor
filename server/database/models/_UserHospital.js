/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import User from './_User';
import Hospital from './_Hospital';

const UserHospital = sqlz.define(
  'user_hospital',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    hospital: {
      type: Sequelize.INTEGER,
      references: {
        model: Hospital,
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

export default UserHospital;

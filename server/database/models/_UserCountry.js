/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import User from './_User';
import firebase from '../firebase';

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

UserCountry.afterUpdate(u => {
  const user = JSON.parse(JSON.stringify(u));
  firebase.database().ref(`user_countries/${user.user}`).update(user);
  return new Promise(resolve => resolve(user));
});

UserCountry.afterDestroy(instance => {
  firebase.database().ref(`user_countries/${instance.user}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default UserCountry;

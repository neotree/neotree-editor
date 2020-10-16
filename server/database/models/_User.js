/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import firebase from '../firebase';

const User = sqlz.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email_hash: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  }
);

User.afterUpdate(u => {
  const user = JSON.parse(JSON.stringify(u));
  firebase.database().ref(`users/${user.email_hash}`).update(user);
  return new Promise(resolve => resolve(user));
});

User.afterDestroy(instance => {
  firebase.database().ref(`users/${instance.email_hash}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default User;

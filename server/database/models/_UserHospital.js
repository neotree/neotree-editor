/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';
import User from './_User';
import Hospital from './_Hospital';
import firebase from '../firebase';

const UserHospital = sqlz.define(
  'user_hospital',
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
    hospital: {
      type: Sequelize.STRING,
      references: {
        model: Hospital,
        key: 'hospital_id'
      }
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

UserHospital.afterUpdate(u => {
  const user = JSON.parse(JSON.stringify(u));
  firebase.database().ref(`user_hospitals/${user.user}`).update(user);
  return new Promise(resolve => resolve(user));
});

UserHospital.afterDestroy(instance => {
  firebase.database().ref(`user_hospitals/${instance.user}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default UserHospital;

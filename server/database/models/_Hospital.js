import Sequelize from 'sequelize';
import sqlz from './sequelize';
import firebase from '../firebase';

const Hospital = sqlz.define(
  'hospital',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    hospital_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    country: {
      type: Sequelize.STRING,
    },
  }
);

Hospital.afterUpdate(h => {
  const hospital = JSON.parse(JSON.stringify(h));
  firebase.database().ref(`hospitals/${hospital.hospital_id}`).update(hospital);
  return new Promise(resolve => resolve(hospital));
});

Hospital.afterDestroy(instance => {
  firebase.database().ref(`hospitals/${instance.hospital_id}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default Hospital;

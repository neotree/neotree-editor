import Sequelize from 'sequelize';
import sqlz from './sequelize';

import firebase from '../firebase';

const Diagnosis = sqlz.define(
  'diagnosis',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    diagnosis_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('data') || '{}');
      },
      set: function (value) {
        this.setDataValue('data', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
    position: {
      type: Sequelize.INTEGER
    },
    script_id: {
      type: Sequelize.STRING,
      // references: {
      //   model: Script,
      //   key: 'id'
      // }
    },
  }
);

Diagnosis.afterUpdate(diagnosis => {
  const { id, diagnosis_id, data: { createdAt: cAt, ...data }, createdAt, ...d } = JSON.parse(JSON.stringify(diagnosis)); // eslint-disable-line
  firebase.database().ref(`diagnosis/${diagnosis.script_id}/${diagnosis_id}`).update({
    ...data,
    ...d,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
  return new Promise(resolve => resolve(diagnosis));
});
Diagnosis.afterDestroy(instance => {
  firebase.database().ref(`diagnosis/${instance.script_id}/${instance.diagnosis_id}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default Diagnosis;

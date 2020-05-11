import Sequelize from 'sequelize';
import sqlz from './sequelize';

import firebase from '../firebase';

const Script = sqlz.define(
  'script',
  {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
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
  }
);

Script.afterUpdate(script => {
  const { id, data: { createdAt: cAt, ...data }, createdAt, ...scr } = JSON.parse(JSON.stringify(script));  // eslint-disable-line
  firebase.database().ref(`scripts/${id}`).update({
    ...data,
    ...scr,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
  return new Promise(resolve => resolve(script));
});
Script.afterDestroy(instance => {
  firebase.database().ref(`screens/${instance.id}`).remove();
  firebase.database().ref(`diagnosis/${instance.id}`).remove();
  firebase.database().ref(`scripts/${instance.id}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default Script;

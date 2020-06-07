import Sequelize from 'sequelize';
import sqlz from './sequelize';

import firebase from '../firebase';

const ConfigKey = sqlz.define(
  'config_key',
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

ConfigKey.afterUpdate(cKey => {
  const { id, data: { createdAt: cAt, ...data }, createdAt, ...c } = JSON.parse(JSON.stringify(cKey)); // eslint-disable-line
  firebase.database().ref(`configkeys/${id}`).update({
    ...data,
    ...c,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
  return new Promise(resolve => resolve(cKey));
});
ConfigKey.afterDestroy(instance => {
  firebase.database().ref(`configkeys/${instance.id}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default ConfigKey;

import Sequelize from 'sequelize';
import sqlz from './sequelize';

import firebase from '../firebase';

const Screen = sqlz.define(
  'screen',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    screen_id: {
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
    type: {
      type: Sequelize.STRING
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

Screen.afterUpdate(script => {
  const { id, screen_id, data: { createdAt: cAt, ...data }, createdAt, ...scr } = JSON.parse(JSON.stringify(script));  // eslint-disable-line
  firebase.database().ref(`screens/${script.script_id}/${screen_id}`).update({
    ...data,
    ...scr,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  });
  return new Promise(resolve => resolve(script));
});
Screen.afterDestroy(instance => {
  firebase.database().ref(`screens/${instance.script_id}/${instance.screen_id}`).remove();
  return new Promise(resolve => resolve(instance));
});

export default Screen;

import Sequelize from 'sequelize';
import sqlz from './sequelize';

import firebase from '../firebase';

const Script = sqlz.define(
  'log',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
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
  }
);

export default Script;

/* eslint-disable object-shorthand */
import Sequelize from 'sequelize';
import sqlz from './sequelize';

const User = sqlz.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    role: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
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
    deletedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
  }
);

export default User;

import Sequelize from 'sequelize';
import sqlz from './sequelize';

const ConfigKey = sqlz.define(
  'configuration',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    unique_key: {
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
    deletedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
  }
);

export default ConfigKey;

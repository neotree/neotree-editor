import Sequelize from 'sequelize';
import sqlz from './sequelize';

const Device = sqlz.define(
  'device',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    device_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    device_hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    scripts_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    details: {
      type: Sequelize.JSON,
      defaultValue: JSON.stringify({}),
      get: function () {
        return JSON.parse(this.getDataValue('details') || '{}');
      },
      set: function (value) {
        this.setDataValue('details', typeof data === 'object' ? JSON.stringify(value) : value);
      }
    },
  }
);

export default Device;

import Sequelize from 'sequelize';
import sqlz from './sequelize';

const Script = sqlz.define(
  'app',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    version: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },

    version_hash: {
      type: Sequelize.STRING,
    },

    last_backup_date: {
      type: Sequelize.DATE,
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

export default Script;

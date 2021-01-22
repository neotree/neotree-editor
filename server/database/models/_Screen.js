import Sequelize from 'sequelize';
import sqlz from './sequelize';

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
      //   model: ScriptPage,
      //   key: 'id'
      // }
    },
    deletedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
  }
);

export default Screen;

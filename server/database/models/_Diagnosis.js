import Sequelize from 'sequelize';
import sqlz from './sequelize';

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

export default Diagnosis;

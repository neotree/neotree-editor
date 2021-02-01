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

    last_backup_date: {
      type: Sequelize.DATE,
    },

    deletedAt: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
  }
);

export default Script;

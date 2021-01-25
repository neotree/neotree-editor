import Sequelize from 'sequelize';
import sqlz from './sequelize';

const ApiKey = sqlz.define(
  'api_key',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  }
);

export default ApiKey;

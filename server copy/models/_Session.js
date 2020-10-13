import Sequelize from 'sequelize';
import sqlz from './sequelize';

const Session = sqlz.define(
  'session',
  {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    userId: Sequelize.STRING,
    expires: Sequelize.DATE,
    data: Sequelize.STRING(50000)
  }
);

export default Session;

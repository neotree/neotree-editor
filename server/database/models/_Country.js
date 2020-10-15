import Sequelize from 'sequelize';
import sqlz from './sequelize';

const Country = sqlz.define(
  'country',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  }
);

export default Country;

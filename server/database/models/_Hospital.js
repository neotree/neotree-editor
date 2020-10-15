import Sequelize from 'sequelize';
import sqlz from './sequelize';

const Hospital = sqlz.define(
  'hospital',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
  }
);

export default Hospital;

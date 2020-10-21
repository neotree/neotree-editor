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
    hospital_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    country: {
      type: Sequelize.STRING,
    },
  }
);

export default Hospital;

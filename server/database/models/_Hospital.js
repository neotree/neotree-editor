import Sequelize from 'sequelize';
import sqlz from './sequelize';
import Country from './_Country';

const Hospital = sqlz.define(
  'hospital',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firebase_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.INTEGER,
      references: {
        model: Country,
        key: 'id'
      }
    },
  }
);

export default Hospital;

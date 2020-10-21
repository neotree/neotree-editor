import Sequelize from 'sequelize';

export default new Sequelize(
  process.env.POSTGRES_DB_NAME,
  process.env.POSTGRES_DB_USER,
  process.env.POSTGRES_DB_USER_PASS,
  { 
    dialect: 'postgres', 
    host: process.env.POSTGRES_DB_HOST,     
    logging: false, // process.env.NODE_ENV !== 'production'
  }
);

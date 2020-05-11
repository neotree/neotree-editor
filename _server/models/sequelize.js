import Sequelize from 'sequelize';
import config from '../../_config/server';

const dbConfig = config.database;

const sequelize = new Sequelize(
  process.env.DATABASE_NAME || dbConfig.database,
  process.env.DATABASE_USERNAME || dbConfig.username,
  process.env.DATABASE_PASSWORD || dbConfig.password,
  { host: dbConfig.host || 'localhost', dialect: 'postgres', logging: false }
);

export { Sequelize };

export default sequelize;

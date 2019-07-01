import path from 'path';
import express from 'express';
import setMiddlewares from './middlewares';
import { sequelize, dbInit } from './models';

let app = express();

const config = app.config = process.env.NODE_ENV === 'production' ?
  require('../_config/config.production.json') : require('../_config/config.development.json');

app.sequelize = sequelize;
app.logger = require('../_utils/logger');

const initDatabase = async () => {
  try {
    await dbInit();
  } catch (e) {
    console.log('DATABASE INIT ERROR:', err); // eslint-disable-line
    process.exit(1);
  }
};
initDatabase();

const httpServer = require('http').Server(app);
app.io = require('socket.io')(httpServer);

app = setMiddlewares(app);

app.use(express.static(path.resolve(__dirname, '../src'), { index: false }));

app.get('*',
  require('./routes/app/getAppMiddleware')(app),
  require('./routes/users/getAuthenticatedUserMiddleware')(app),
  require('./middlewares/sendHTML')(app)
);

app.server = httpServer.listen(config.port, err => {
  if (err) throw (err);
  console.log(`Server started on port ${config.port}`); // eslint-disable-line
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server'); // eslint-disable-line
  app.wdm.close();
  app.server.close(() => {
    process.exit(0);
  });
});

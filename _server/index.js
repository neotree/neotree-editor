import path from 'path';
import express from 'express';
import setMiddlewares from './middlewares';
import { sequelize, dbInit } from './models';
import config from '../_config/server';

Promise.all([
  dbInit()
])
  .catch(e => {
    console.log('DATABASE INIT ERROR:', e); // eslint-disable-line
    process.exit(1);
  })
  .then(() => {
    let app = express();

    app.sequelize = sequelize;
    app.logger = require('../_utils/logger');
    
    const httpServer = require('http').Server(app);
    app.io = require('socket.io')(httpServer);

    app = setMiddlewares(app);

    app.use('/assets', express.static(path.resolve(__dirname, '../src/assets'), { index: false }));

    app.use(express.static(path.resolve(__dirname, '../src'), { index: false }));

    app.get('*',
      require('./routes/app/initialiseAppMiddleware')(app),
      require('./middlewares/sendHTML')(app)
    );

    app.server = httpServer.listen(config.port, err => {
      if (err) throw (err);
      console.log(`Server started on port ${config.port}`); // eslint-disable-line
    });
  });

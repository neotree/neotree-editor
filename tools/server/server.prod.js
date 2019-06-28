import express from 'express';
import path from 'path';
// import serveFavicon from 'serve-favicon';
import compression from 'compression';
import setAppMiddlewares from './setAppMiddlewares';
import { sequelize, dbInit } from './models';

const startServer = async function () {
  try {
    await dbInit();

    let app = express();

    app.sequelize = sequelize;

    app = setAppMiddlewares(app);

    // favicon
    // app.use(serveFavicon(path.resolve(__dirname, '../dist/favicon.ico')));

    app.use(compression());

    app.use(express.static(path.resolve(__dirname, '../../src')));

    app = require('./routes')(app);

    app.get('*',
      (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../src/index.html'));
      }
    );
  } catch (err) {
    console.log('DATABASE ERROR:', err); // eslint-diable-line
    process.exit(1);
  }
};

startServer();

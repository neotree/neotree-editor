import path from 'path';
import express from 'express';
import * as database from './database';

const isProd = process.env.NODE_ENV === 'production';

(async () => {
  const app = express();
  const httpServer = require('http').Server(app);
  app.logger = require('../utils/logger');
  app.io = require('socket.io')(httpServer); // socket io

  app.getRandomString = (separator = '') => {
    const getRandString = () => Math.random().toString(36).substring(2).toUpperCase();
    return `${getRandString()}${separator}${getRandString()}${separator}${getRandString()}`;
  };

  // custom middlewares
  app.use(require('./_requestQueryHandlerMiddleware')); // injects res.locals.reqQuery
  app.use(require('./_requestHandlerMiddleware')); // injects res.locals.setResponse & res.locals.getResponse

  // database
  let sequelize = null;
  try {
    sequelize = await database.connect();
    app.logger.log('Database connected');
  } catch (e) {
    app.logger.error('Database connection failed', e);
    process.exit(1);
  }

  app.sequelize = sequelize;

  // seed admin user
  if (process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS) {
    try {
      await require('./utils/addOrUpdateUser')({
        role: 1,
        password: process.env.DEFAULT_ADMIN_USER_PASSWORD,
        email: process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS,
      });
    } catch (e) { /* Do nothing */ }
  }

  //body-parser
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // webpack
  if (!isProd) {
    const webpackConfig = require('../webpack.config');
    const compiler = require('webpack')(webpackConfig);
    app.wdm = require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    });
    app.use(app.wdm);
    app.use(require('webpack-hot-middleware')(compiler));

    app.use('/assets', express.static(path.resolve(__dirname, '../assets')));
  } else {
    app.use('/assets', express.static(path.resolve(__dirname, '../../assets')));
  }

  app.use(express.static(path.resolve(__dirname, '../src'), { index: false, }));

  app.use(require('./routes')(app));

  app.get('*', require('./_serveHtmlMiddleware')(app));

  app.server = httpServer.listen(process.env.SERVER_PORT, err => {
    if (err) throw (err);
    app.logger.log(`Server started on port ${process.env.SERVER_PORT}`);
  });
})();

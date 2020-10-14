import path from 'path';
import express from 'express';
import * as database from './database';

(async () => {
  let app = express();
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

  //body-parser
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  //express session
  const session = require('express-session');
  const SequelizeStore = require('connect-session-sequelize')(session.Store);
  const sessStore = new SequelizeStore({ db: app.sequelize, });
  app.use(session({
    secret: 'neotree',
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: sessStore,
    cookie: { maxAge: 365 * 24 * 60 * 60 } // = 365 days (exp date will be created from ttl opt)
  }));
  sessStore.sync();

  // webpack
  if (process.env.NODE_ENV !== 'production') {
    const webpackConfig = require('../webpack.config');
    const compiler = require('webpack')(webpackConfig);
    app.wdm = require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    });
    app.use(app.wdm);
    app.use(require('webpack-hot-middleware')(compiler));
  }

  // passport
  app = require('./passport')(app);

  app.use('/assets', express.static(path.resolve(__dirname, '../assets')));

  app.use(require('./routes')(app));

  app.get('*', require('./_serveHtmlMiddleware')(app));

  app.server = httpServer.listen(process.env.SERVER_PORT, err => {
    if (err) throw (err);
    app.logger.log(`Server started on port ${process.env.SERVER_PORT}`);
  });
})();

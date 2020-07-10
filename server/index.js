import path from 'path';
import express from 'express';
import { dbInit } from './models';
import config from '../config/server';

const getRandString = () => Math.random().toString(36).substring(2).toUpperCase();

(async () => {
  const sequelize = await dbInit();

  let app = express();

  app.sequelize = sequelize;
  app.logger = require('../utils/logger');
  app.getRandomString = (separator = '') => 
    `${getRandString()}${separator}${getRandString()}${separator}${getRandString()}`;

  const httpServer = require('http').Server(app);

  // socket io
  app.io = require('socket.io')(httpServer);

  //body-parser
  app.use(require('body-parser').json());
  app.use(require('body-parser').urlencoded({ extended: false }));

  //express validator
  app.use(require('express-validator')({
    errorFormatter: (param, msg, value) => {
      const namespace = param.split('.');
      const root = namespace.shift();
      let formParam = root;
      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return { param: formParam, msg, value };
    }
  }));

  //express session
  const session = require('express-session');
  const SequelizeStore = require('connect-session-sequelize')(session.Store);
  const sessStore = new SequelizeStore({ db: app.sequelize });
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
    const webpackConfig = require('../webpack.development.config');
    const compiler = require('webpack')(webpackConfig);
    app.wdm = require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    });
    app.use(app.wdm);
    app.use(require('webpack-hot-middleware')(compiler));
  }

  app = require('./middlewares')(app);

  app.use(require('./routes')(app));

  app.use(express.static(path.resolve(__dirname, '../src')));
  app.use('/assets', express.static(path.resolve(__dirname, '../assets')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../src/index.html'));
  });

  app.server = httpServer.listen(config.port, err => {
    if (err) throw (err);
    app.logger.log(`Server started on port ${config.port}`);
  });
})();

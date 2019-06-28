/* eslint-disable no-console */
import session from 'express-session';
import passport from './passport';

export default (app) => {
  const httpServer = require('http').Server(app);
  const io = require('socket.io')(httpServer);

  const PORT = app.PORT = 3000;
  app.logger = require('../../_utils/logger');
  app.io = io;

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

  app = passport(app);

  app.use((req, res, next) => {
    res.locals[req.originalUrl] = { payload: {} };
    res.locals.setResponse = (error, payload = {}) => {
      if (error) res.locals[req.originalUrl][error.map ? 'errors' : 'error'] = error;

      res.locals[req.originalUrl].payload = {
        ...res.locals[req.originalUrl].payload,
        ...payload
      };
    };
    res.locals.getResponse = () => res.locals[req.originalUrl];
    res.locals.getResponsePayload = () => res.locals[req.originalUrl].payload;
    res.locals.getResponseError = () =>
      res.locals[req.originalUrl].error || res.locals[req.originalUrl].errors;
    next();
  });

  app.responseMiddleware = (req, res) => {
    const response = res.locals.getResponse();
    res.json(response);
  };

  httpServer.listen(PORT, err => {
    if (err) throw (err);
    console.log(`Server started on port ${PORT}`);
  });

  return app;
};

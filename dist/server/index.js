"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _models = require("./models");

var _server = _interopRequireDefault(require("../config/server"));

(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var sequelize, app, httpServer, session, SequelizeStore, sessStore, webpackConfig, compiler;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _models.dbInit)();

        case 2:
          sequelize = _context.sent;
          app = (0, _express["default"])();
          app.sequelize = sequelize;
          app.logger = require('../utils/logger');
          httpServer = require('http').Server(app); // socket io

          app.io = require('socket.io')(httpServer); //body-parser

          app.use(require('body-parser').json());
          app.use(require('body-parser').urlencoded({
            extended: false
          })); //express validator

          app.use(require('express-validator')({
            errorFormatter: function errorFormatter(param, msg, value) {
              var namespace = param.split('.');
              var root = namespace.shift();
              var formParam = root;

              while (namespace.length) {
                formParam += "[".concat(namespace.shift(), "]");
              }

              return {
                param: formParam,
                msg: msg,
                value: value
              };
            }
          })); //express session

          session = require('express-session');
          SequelizeStore = require('connect-session-sequelize')(session.Store);
          sessStore = new SequelizeStore({
            db: app.sequelize
          });
          app.use(session({
            secret: 'neotree',
            saveUninitialized: false,
            // don't create session until something stored
            resave: false,
            //don't save session if unmodified
            store: sessStore,
            cookie: {
              maxAge: 365 * 24 * 60 * 60
            } // = 365 days (exp date will be created from ttl opt)

          }));
          sessStore.sync(); // webpack

          if (process.env.NODE_ENV !== 'production') {
            webpackConfig = require('../webpack.development.config');
            compiler = require('webpack')(webpackConfig);
            app.wdm = require('webpack-dev-middleware')(compiler, {
              noInfo: true,
              publicPath: webpackConfig.output.publicPath
            });
            app.use(app.wdm);
            app.use(require('webpack-hot-middleware')(compiler));
          }

          app = require('./middlewares')(app);
          app.use(require('./routes')(app));
          app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../src')));
          app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../assets')));
          app.get('*', function (req, res) {
            res.sendFile(_path["default"].resolve(__dirname, '../src/index.html'));
          });
          app.server = httpServer.listen(_server["default"].port, function (err) {
            if (err) throw err;
            app.logger.log("Server started on port ".concat(_server["default"].port));
          });

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();
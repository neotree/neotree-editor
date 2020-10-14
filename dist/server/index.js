"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var database = _interopRequireWildcard(require("./database"));

var isProd = process.env.NODE_ENV !== 'production';
(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var app, httpServer, sequelize, bodyParser, session, SequelizeStore, sessStore, webpackConfig, compiler;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          app = (0, _express["default"])();
          httpServer = require('http').Server(app);
          app.logger = require('../utils/logger');
          app.io = require('socket.io')(httpServer); // socket io

          app.getRandomString = function () {
            var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            var getRandString = function getRandString() {
              return Math.random().toString(36).substring(2).toUpperCase();
            };

            return "".concat(getRandString()).concat(separator).concat(getRandString()).concat(separator).concat(getRandString());
          }; // custom middlewares


          app.use(require('./_requestQueryHandlerMiddleware')); // injects res.locals.reqQuery

          app.use(require('./_requestHandlerMiddleware')); // injects res.locals.setResponse & res.locals.getResponse
          // database

          sequelize = null;
          _context.prev = 8;
          _context.next = 11;
          return database.connect();

        case 11:
          sequelize = _context.sent;
          app.logger.log('Database connected');
          _context.next = 19;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](8);
          app.logger.error('Database connection failed', _context.t0);
          process.exit(1);

        case 19:
          app.sequelize = sequelize; //body-parser

          bodyParser = require('body-parser');
          app.use(bodyParser.json());
          app.use(bodyParser.urlencoded({
            extended: false
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

          if (isProd) {
            webpackConfig = require('../webpack.config');
            compiler = require('webpack')(webpackConfig);
            app.wdm = require('webpack-dev-middleware')(compiler, {
              noInfo: true,
              publicPath: webpackConfig.output.publicPath
            });
            app.use(app.wdm);
            app.use(require('webpack-hot-middleware')(compiler));
          } // passport


          app = require('./passport')(app);

          if (isProd) {
            app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../../src'), {
              index: false
            }));
            app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../../assets')));
          } else {
            app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../src'), {
              index: false
            }));
            app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../assets')));
          }

          app.use(require('./routes')(app));
          app.get('*', require('./_serveHtmlMiddleware')(app));
          app.server = httpServer.listen(process.env.SERVER_PORT, function (err) {
            if (err) throw err;
            app.logger.log("Server started on port ".concat(process.env.SERVER_PORT));
          });

        case 34:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[8, 15]]);
}))();
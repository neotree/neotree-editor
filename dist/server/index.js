"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _path = _interopRequireDefault(require("path"));
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var database = _interopRequireWildcard(require("./database"));
var _sync = _interopRequireDefault(require("./firebase/sync"));
var _backup = require("./utils/backup");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var isProd = process.env.NODE_ENV === 'production';
(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var app, httpServer, sequelize, appInfo, bodyParser, session, SequelizeStore, sessStore, webpackConfig, compiler;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        app = (0, _express["default"])();
        httpServer = require('http').Server(app);
        app.logger = require('../utils/logger');
        app.io = require('socket.io')(httpServer); // socket io

        app.use((0, _cors["default"])());
        app.getRandomString = function () {
          var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          var getRandString = function getRandString() {
            return Math.random().toString(36).substring(2).toUpperCase();
          };
          return "".concat(getRandString()).concat(separator).concat(getRandString()).concat(separator).concat(getRandString());
        };

        // custom middlewares
        app.use(require('./_requestQueryHandlerMiddleware')); // injects res.locals.reqQuery
        app.use(require('./_requestHandlerMiddleware')); // injects res.locals.setResponse & res.locals.getResponse

        // database
        sequelize = null;
        _context.prev = 9;
        _context.next = 12;
        return database.connect();
      case 12:
        sequelize = _context.sent;
        app.logger.log('Database connected');
        _context.next = 20;
        break;
      case 16:
        _context.prev = 16;
        _context.t0 = _context["catch"](9);
        app.logger.error('Database connection failed', _context.t0);
        process.exit(1);
      case 20:
        app.sequelize = sequelize;
        _context.prev = 21;
        _context.next = 24;
        return database.App.findOne({
          where: {
            id: 1
          }
        });
      case 24:
        appInfo = _context.sent;
        if (appInfo) {
          _context.next = 28;
          break;
        }
        _context.next = 28;
        return (0, _backup.backupData)(app);
      case 28:
        _context.next = 33;
        break;
      case 30:
        _context.prev = 30;
        _context.t1 = _context["catch"](21);
        console.log(_context.t1);
      case 33:
        // firebase
        // try { await syncFirebase(); } catch (e) { console.log(e); }
        //body-parser
        bodyParser = require('body-parser');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
          extended: false
        }));

        //express session
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

        sessStore.sync();

        // webpack
        if (!isProd) {
          webpackConfig = require('../webpack.config');
          compiler = require('webpack')(webpackConfig);
          app.wdm = require('webpack-dev-middleware')(compiler, {
            noInfo: true,
            publicPath: webpackConfig.output.publicPath
          });
          app.use(app.wdm);
          app.use(require('webpack-hot-middleware')(compiler));
          app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../assets')));
        } else {
          app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../../assets')));
        }
        app = require('./_passport')(app);
        app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../src'), {
          index: false
        }));
        app.use(require('./routes')(app));
        app.get('*', require('./_serveHtmlMiddleware')(app));
        app.server = httpServer.listen(process.env.SERVER_PORT, function (err) {
          if (err) throw err;
          app.logger.log("Server started on port ".concat(process.env.SERVER_PORT));
        });
      case 47:
      case "end":
        return _context.stop();
    }
  }, _callee, null, [[9, 16], [21, 30]]);
}))();
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(isProd, "isProd", "/home/farai/Workbench/neotree-editor/server/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
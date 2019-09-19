"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _middlewares = _interopRequireDefault(require("./middlewares"));

var _models = require("./models");

var firebase = _interopRequireWildcard(require("./firebase"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var app = (0, _express["default"])();
var config = app.config = process.env.NODE_ENV === 'production' ? require('../_config/config.production.json') : require('../_config/config.development.json');
app.sequelize = _models.sequelize;
app.logger = require('../_utils/logger');

var initDatabase =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _models.dbInit)();

          case 3:
            _context.next = 9;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            console.log('DATABASE INIT ERROR:', _context.t0); // eslint-disable-line

            process.exit(1);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function initDatabase() {
    return _ref.apply(this, arguments);
  };
}();

initDatabase();

var httpServer = require('http').Server(app);

app.io = require('socket.io')(httpServer);
app = (0, _middlewares["default"])(app);
app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../src/assets'), {
  index: false
}));
app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../src'), {
  index: false
}));
app.get('*', require('./routes/app/initialiseAppMiddleware')(app), require('./middlewares/sendHTML')(app));
app.server = httpServer.listen(config.port, function (err) {
  if (err) throw err;
  console.log("Server started on port ".concat(config.port)); // eslint-disable-line
});
firebase.sync();
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(app, "app", "/home/bws/WorkBench/neotree-editor/_server/index.js");
  reactHotLoader.register(config, "config", "/home/bws/WorkBench/neotree-editor/_server/index.js");
  reactHotLoader.register(initDatabase, "initDatabase", "/home/bws/WorkBench/neotree-editor/_server/index.js");
  reactHotLoader.register(httpServer, "httpServer", "/home/bws/WorkBench/neotree-editor/_server/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
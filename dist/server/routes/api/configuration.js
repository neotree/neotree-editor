"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

var _database = require("../../database");

var _excluded = ["data"],
    _excluded2 = ["data"],
    _excluded3 = ["key"];

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = function _default(app, router) {
  router.get('/get-configuration', (0, _apiKeyAuthenticator["default"])(app), function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var key, done, configKeys, configuration, _JSON$parse, data, s;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              key = req.query.key;

              done = function done(err, rslts) {
                res.locals.setResponse(err, _objectSpread({
                  configuration: null,
                  configKeys: []
                }, rslts));
                next();
              };

              configKeys = [];
              configuration = null;
              _context.prev = 4;
              _context.next = 7;
              return _database.ConfigKey.findAll({
                where: {
                  deletedAt: null
                },
                order: [['position', 'ASC']]
              });

            case 7:
              configKeys = _context.sent;
              _context.next = 10;
              return _database.Configuration.findOne({
                where: {
                  unique_key: key
                }
              });

            case 10:
              configuration = _context.sent;

              if (configuration) {
                _JSON$parse = JSON.parse(JSON.stringify(configuration)), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
                configuration = _objectSpread(_objectSpread({}, data), s);
              }

              _context.next = 17;
              break;

            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](4);
              return _context.abrupt("return", done(_context.t0));

            case 17:
              done(null, {
                configuration: configuration,
                configKeys: configKeys
              });

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[4, 14]]);
    }))();
  }, require('../../utils/responseMiddleware'));
  router.post('/add-configuration', (0, _apiKeyAuthenticator["default"])(app), function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var payload, done, configuration, rslts, _JSON$parse2, data, s;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              payload = req.body;

              done = function done(err, configuration) {
                res.locals.setResponse(err, {
                  configuration: configuration
                });
                next();
              };

              configuration = null;
              _context2.prev = 3;
              _context2.next = 6;
              return _database.Configuration.create(payload);

            case 6:
              rslts = _context2.sent;

              if (rslts && rslts[0]) {
                _JSON$parse2 = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse2.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse2, _excluded2);
                configuration = _objectSpread(_objectSpread({}, data), s);
              }

              _context2.next = 13;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 13:
              done(null, configuration);

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 10]]);
    }))();
  }, require('../../utils/responseMiddleware'));
  router.post('/update-configuration', (0, _apiKeyAuthenticator["default"])(app), function (req, res, next) {
    var _req$body = req.body,
        key = _req$body.key,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, _excluded3);

    var done = function done(err, configuration) {
      res.locals.setResponse(err, {
        configuration: configuration
      });
      next();
    };

    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var configuration;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (key) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", done(new Error('Required configuration "key" is not provided.')));

            case 2:
              configuration = null;
              _context3.prev = 3;
              _context3.next = 6;
              return _database.Configuration.findOne({
                where: {
                  unique_key: key
                }
              });

            case 6:
              configuration = _context3.sent;
              _context3.next = 12;
              break;

            case 9:
              _context3.prev = 9;
              _context3.t0 = _context3["catch"](3);
              return _context3.abrupt("return", done(_context3.t0));

            case 12:
              if (configuration) {
                _context3.next = 14;
                break;
              }

              return _context3.abrupt("return", reject(new Error("Configuration with unique_key \"".concat(key, "\" not found"))));

            case 14:
              _context3.prev = 14;
              _context3.next = 17;
              return _database.Configuration.update({
                data: JSON.stringify(_objectSpread(_objectSpread({}, configuration.data), payload))
              }, {
                where: {
                  unique_key: key,
                  deletedAt: null
                }
              });

            case 17:
              _context3.next = 22;
              break;

            case 19:
              _context3.prev = 19;
              _context3.t1 = _context3["catch"](14);
              return _context3.abrupt("return", done(_context3.t1));

            case 22:
              done(null, configuration);

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[3, 9], [14, 19]]);
    }))();
  }, require('../../utils/responseMiddleware'));
  return router;
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/api/configuration.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
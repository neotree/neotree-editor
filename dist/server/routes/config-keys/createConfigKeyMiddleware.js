"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _database = require("../../database");
var _excluded = ["data"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, done, configKeyId, snap, configKeysCount, configKey, rslts, _JSON$parse, data, s;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            payload = req.body;
            done = function done(err, configKey) {
              res.locals.setResponse(err, {
                configKey: configKey
              });
              next();
            };
            configKeyId = null;
            _context.prev = 3;
            _context.next = 6;
            return _firebase["default"].database().ref('configKeys').push();
          case 6:
            snap = _context.sent;
            configKeyId = snap.key;
            _context.next = 13;
            break;
          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 13:
            configKeysCount = 0;
            _context.prev = 14;
            _context.next = 17;
            return _database.ConfigKey.count({
              where: {}
            });
          case 17:
            configKeysCount = _context.sent;
            _context.next = 22;
            break;
          case 20:
            _context.prev = 20;
            _context.t1 = _context["catch"](14);
          case 22:
            configKey = _objectSpread(_objectSpread({}, payload), {}, {
              configKeyId: configKeyId,
              position: configKeysCount + 1,
              createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
              updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
            });
            _context.prev = 23;
            _context.next = 26;
            return _database.ConfigKey.findOrCreate({
              where: {
                config_key_id: configKey.configKeyId
              },
              defaults: {
                position: configKey.position,
                data: JSON.stringify(configKey)
              }
            });
          case 26:
            rslts = _context.sent;
            if (rslts && rslts[0]) {
              _JSON$parse = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
              configKey = _objectSpread(_objectSpread({}, data), s);
            }
            _context.next = 33;
            break;
          case 30:
            _context.prev = 30;
            _context.t2 = _context["catch"](23);
            return _context.abrupt("return", done(_context.t2));
          case 33:
            done(null, configKey);
          case 34:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 10], [14, 20], [23, 30]]);
    }))();
  };
};
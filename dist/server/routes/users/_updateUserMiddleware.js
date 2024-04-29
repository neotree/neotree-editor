"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../../database");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
      role = _req$body.role,
      user_id = _req$body.user_id,
      hospitals = _req$body.hospitals,
      countries = _req$body.countries;
    var done = function done(err, user) {
      res.locals.setResponse(err, {
        user: user
      });
      next();
    };
    if (!user_id) return done({
      msg: 'Required user "id" is not provided.'
    });
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var u, _JSON$parse, data, user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _database.User.findOne({
              where: {
                user_id: user_id
              }
            });
          case 3:
            u = _context.sent;
            if (!u) {
              _context.next = 14;
              break;
            }
            _JSON$parse = JSON.parse(JSON.stringify(u)), data = _JSON$parse.data;
            _context.next = 8;
            return _database.User.update(Object.assign({}, {
              data: JSON.stringify(_objectSpread(_objectSpread({}, data), {}, {
                countries: countries || data.countries,
                hospitals: hospitals || data.hospitals
              }))
            }, role ? {
              role: role
            } : {}), {
              where: {
                user_id: user_id
              }
            });
          case 8:
            _context.next = 10;
            return _database.User.findOne({
              where: {
                user_id: user_id
              }
            });
          case 10:
            user = _context.sent;
            done(null, user);
            _context.next = 15;
            break;
          case 14:
            done(new Error('User not found'));
          case 15:
            _context.next = 20;
            break;
          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](0);
            done(_context.t0);
          case 20:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 17]]);
    }))();
  };
};
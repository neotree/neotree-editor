"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _database = require("../../database");
var _excluded = ["userId"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
      userId = _req$body.userId,
      payload = (0, _objectWithoutProperties2["default"])(_req$body, _excluded);
    var done = function done(err, user) {
      res.locals.setResponse(err, {
        user: user
      });
      next();
    };
    if (!userId) return done({
      msg: 'Required user "id" is not provided.'
    });
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            user = null;
            _context.prev = 1;
            _context.next = 4;
            return new Promise(function (resolve) {
              _firebase["default"].database().ref("users/".concat(userId)).on('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 4:
            user = _context.sent;
            _context.next = 9;
            break;
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](1);
          case 9:
            if (user) {
              _context.next = 11;
              break;
            }
            return _context.abrupt("return", done('User not found'));
          case 11:
            user = _objectSpread(_objectSpread({}, user), payload);
            _context.prev = 12;
            _context.next = 15;
            return _firebase["default"].database().ref("users/".concat(userId)).set(user);
          case 15:
            _context.next = 20;
            break;
          case 17:
            _context.prev = 17;
            _context.t1 = _context["catch"](12);
            return _context.abrupt("return", done(_context.t1));
          case 20:
            _context.prev = 20;
            _context.next = 23;
            return _database.User.update({
              data: JSON.stringify(user)
            }, {
              where: {
                email: user.email
              }
            });
          case 23:
            _context.next = 27;
            break;
          case 25:
            _context.prev = 25;
            _context.t2 = _context["catch"](20);
          case 27:
            done(null, user);
          case 28:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 7], [12, 17], [20, 25]]);
    }))();
  };
};
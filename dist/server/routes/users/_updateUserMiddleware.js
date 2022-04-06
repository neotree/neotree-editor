"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _database = require("../../database");

var _excluded = ["userId"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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
        while (1) {
          switch (_context.prev = _context.next) {
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
        }
      }, _callee, null, [[1, 7], [12, 17], [20, 25]]);
    }))();
  };
};
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _passport = _interopRequireDefault(require("passport"));

var _database = require("../database");

var errorCodes = _interopRequireWildcard(require("../../constants/error-codes/auth"));

var LocalStrategy = require('passport-local').Strategy;

module.exports = function (app) {
  _passport["default"].serializeUser(function (user, done) {
    done(null, user.id);
  });

  _passport["default"].deserializeUser(function (_id, done) {
    _database.User.findOne({
      where: {
        id: _id
      },
      attributes: ['id']
    }).then(function (user) {
      done(null, user);
      return null;
    })["catch"](done);
  });
  /******************************************************************************
  **************************** LOCAL STRATEGY ***********************************/


  _passport["default"].use(new LocalStrategy( /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(username, password, done) {
      var user, isMatch;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _database.User.findOne({
                where: {
                  email: username
                }
              });

            case 3:
              user = _context.sent;

              if (user) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", done(new Error(errorCodes.SIGNIN_NO_USER)));

            case 6:
              if (password) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", done(new Error(errorCodes.SIGNIN_MISSNG_PASSWORD)));

            case 8:
              _context.prev = 8;
              _context.next = 11;
              return require('bcryptjs').compare(password, user.password);

            case 11:
              isMatch = _context.sent;

              if (isMatch) {
                _context.next = 14;
                break;
              }

              return _context.abrupt("return", done(new Error(errorCodes.SIGNIN_WRONG_PASSWORD)));

            case 14:
              done(null, user);
              _context.next = 20;
              break;

            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](8);
              done(_context.t0);

            case 20:
              _context.next = 25;
              break;

            case 22:
              _context.prev = 22;
              _context.t1 = _context["catch"](0);
              done(_context.t1);

            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 22], [8, 17]]);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }()));

  app.use(_passport["default"].initialize());
  app.use(_passport["default"].session());
  app.passport = _passport["default"];
  return app;
};
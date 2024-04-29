"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _models = require("../../database/models");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, users;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            done = function done(err, users) {
              res.locals.setResponse(err, {
                users: users
              });
              next();
            };
            users = [];
            _context.prev = 2;
            _context.next = 5;
            return _models.User.findAll({
              where: {
                deletedAt: null
              },
              order: [['createdAt', 'ASC']]
            });
          case 5:
            users = _context.sent;
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](2);
            return _context.abrupt("return", done(_context.t0));
          case 11:
            done(null, users);
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 8]]);
    }))();
  };
};
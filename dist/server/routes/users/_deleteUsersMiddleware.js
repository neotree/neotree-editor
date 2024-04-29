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
      var users, done;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            users = req.body.users;
            done = function done(err, deletedUsers) {
              res.locals.setResponse(err, {
                deletedUsers: deletedUsers
              });
              next();
            };
            _context.prev = 2;
            _context.next = 5;
            return Promise.all(users.filter(function (u) {
              return u.user_id;
            }).map(function (u) {
              return _models.User.destroy({
                where: {
                  user_id: u.user_id
                }
              });
            }));
          case 5:
            done(null, users);
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](2);
            done(_context.t0);
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 8]]);
    }))();
  };
};
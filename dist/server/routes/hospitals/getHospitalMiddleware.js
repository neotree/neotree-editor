"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../../database");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var id, done, hospital;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            id = req.query.id;
            done = function done(err, hospital) {
              res.locals.setResponse(err, {
                hospital: hospital
              });
              next();
            };
            _context.prev = 2;
            _context.next = 5;
            return _database.Hospital.findOne({
              where: {
                id: id
              }
            });
          case 5:
            hospital = _context.sent;
            done(null, hospital);
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](2);
            return _context.abrupt("return", done(_context.t0));
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 9]]);
    }))();
  };
};
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
      var hospitals, done, deletedAt, rslts;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            hospitals = req.body.hospitals;
            done = function done(err) {
              var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
              res.locals.setResponse(err, {
                hospitals: rslts
              });
              next();
            };
            deletedAt = new Date();
            _context.prev = 3;
            _context.next = 6;
            return _models.Hospital.update({
              deletedAt: deletedAt
            }, {
              where: {
                id: hospitals.map(function (s) {
                  return s.id;
                })
              }
            });
          case 6:
            rslts = _context.sent;
            done(null, rslts);
            _context.next = 13;
            break;
          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 10]]);
    }))();
  };
};
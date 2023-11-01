"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _updateScriptMiddleware = require("./updateScriptMiddleware");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scripts, done, updatedScripts;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            scripts = req.body.scripts;
            done = function done(err, updatedScripts) {
              if (err) {
                res.locals.setResponse(err);
                return next();
              }
              res.locals.setResponse(null, {
                updatedScripts: updatedScripts
              });
              next();
            };
            updatedScripts = [];
            _context.prev = 3;
            _context.next = 6;
            return Promise.all(scripts.map(function (s) {
              return (0, _updateScriptMiddleware.updateScript)(s);
            }));
          case 6:
            updatedScripts = _context.sent;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 12:
            done(null, updatedScripts);
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};
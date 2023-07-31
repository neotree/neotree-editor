"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _models = require("../../database/models");
var _excluded = ["id"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var _default = function _default() {
  return function (req, res, next) {
    var _req$body = req.body,
      id = _req$body.id,
      payload = (0, _objectWithoutProperties2["default"])(_req$body, _excluded);
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, rslt;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            done = function done(err, hospital) {
              res.locals.setResponse(err, {
                hospital: hospital
              });
              next();
            };
            _context.prev = 1;
            _context.next = 4;
            return _models.Hospital.update(payload, {
              where: {
                id: id
              },
              returning: true,
              plain: true
            });
          case 4:
            rslt = _context.sent;
            done(null, rslt ? rslt[1] : null);
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return", done(_context.t0));
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8]]);
    }))();
  };
};
var _default2 = _default;
exports["default"] = _default2;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/routes/hospitals/updateHospitalMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
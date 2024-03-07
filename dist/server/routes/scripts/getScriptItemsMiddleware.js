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
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scriptId, done, screens, diagnoses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            scriptId = req.query.scriptId;
            done = function done(err, data) {
              res.locals.setResponse(err, _objectSpread({}, data));
              next();
            };
            screens = [];
            _context.prev = 3;
            _context.next = 6;
            return _database.Screen.findAll({
              where: {
                script_id: scriptId
              }
            });
          case 6:
            screens = _context.sent;
            _context.next = 11;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
          case 11:
            diagnoses = [];
            _context.prev = 12;
            _context.next = 15;
            return _database.Diagnosis.findAll({
              where: {
                script_id: scriptId
              }
            });
          case 15:
            diagnoses = _context.sent;
            _context.next = 20;
            break;
          case 18:
            _context.prev = 18;
            _context.t1 = _context["catch"](12);
          case 20:
            done(null, {
              screens: screens,
              diagnoses: diagnoses
            });
          case 21:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9], [12, 18]]);
    }))();
  };
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../../database");
var _excluded = ["data"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var id, done, diagnosis, _JSON$parse, data, s;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            id = req.query.id;
            done = function done(err, diagnosis) {
              res.locals.setResponse(err, {
                diagnosis: diagnosis
              });
              next();
            };
            diagnosis = null;
            _context.prev = 3;
            _context.next = 6;
            return _database.Diagnosis.findOne({
              where: {
                id: id
              }
            });
          case 6:
            diagnosis = _context.sent;
            if (diagnosis) {
              _JSON$parse = JSON.parse(JSON.stringify(diagnosis)), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
              diagnosis = _objectSpread(_objectSpread({}, data), s);
            }
            _context.next = 13;
            break;
          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 13:
            done(null, diagnosis);
          case 14:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 10]]);
    }))();
  };
};
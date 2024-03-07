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
      var scriptId, done, script, _JSON$parse, data, s;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            scriptId = req.query.scriptId;
            done = function done(err, script) {
              res.locals.setResponse(err, {
                script: script
              });
              next();
            };
            script = null;
            _context.prev = 3;
            _context.next = 6;
            return _database.Script.findOne({
              where: {
                script_id: scriptId
              }
            });
          case 6:
            script = _context.sent;
            if (script) {
              _JSON$parse = JSON.parse(JSON.stringify(script)), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
              script = _objectSpread(_objectSpread({}, data), s);
            }
            _context.next = 13;
            break;
          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 13:
            done(null, script);
          case 14:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 10]]);
    }))();
  };
};
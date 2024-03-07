"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../../database");
var _firebase = _interopRequireDefault(require("../../firebase"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, done, snap, hospital_id, hospital;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            payload = req.body;
            done = function done(err, hospital) {
              res.locals.setResponse(err, {
                hospital: hospital
              });
              next();
            };
            _context.prev = 2;
            _context.next = 5;
            return _firebase["default"].database().ref('configKeys').push();
          case 5:
            snap = _context.sent;
            hospital_id = snap.key;
            _context.next = 9;
            return _database.Hospital.create(_objectSpread(_objectSpread({}, payload), {}, {
              hospital_id: hospital_id
            }));
          case 9:
            hospital = _context.sent;
            done(null, hospital);
            _context.next = 16;
            break;
          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](2);
            return _context.abrupt("return", done(_context.t0));
          case 16:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 13]]);
    }))();
  };
};
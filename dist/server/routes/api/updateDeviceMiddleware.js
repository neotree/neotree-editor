"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _database = require("../../database");
var _excluded = ["deviceId"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
      device_id = _req$body.deviceId,
      params = (0, _objectWithoutProperties2["default"])(_req$body, _excluded);
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var error, device, details;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            error = null;
            device = null;
            _context.prev = 2;
            _context.next = 5;
            return _database.Device.findOne({
              where: {
                device_id: device_id
              }
            });
          case 5:
            device = _context.sent;
            details = null;
            if (device && typeof device.details === 'string') details = JSON.parse(device.details);
            params.details = JSON.stringify(_objectSpread(_objectSpread({}, details), params.details));
            _context.next = 11;
            return _database.Device.update(params, {
              where: {
                device_id: device_id
              }
            });
          case 11:
            _context.next = 13;
            return _database.Device.findOne({
              where: {
                device_id: device_id
              }
            });
          case 13:
            device = _context.sent;
            _context.next = 19;
            break;
          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](2);
            error = new Error("Failed to update device: ".concat(_context.t0.message));
          case 19:
            res.locals.setResponse(error, {
              device: device
            });
            next();
          case 21:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 16]]);
    }))();
  };
};
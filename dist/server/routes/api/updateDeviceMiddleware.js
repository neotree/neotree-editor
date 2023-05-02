"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _database = require("../../database");
var _excluded = ["deviceId"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
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
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        device_id = _req$body.deviceId,
        params = (0, _objectWithoutProperties2["default"])(_req$body, ["deviceId"]);
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var error, device;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
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
              params.details = JSON.stringify(_objectSpread(_objectSpread({}, device.details), params.details));
              _context.next = 9;
              return _database.Device.update(params, {
                where: {
                  device_id: device_id
                }
              });

            case 9:
              _context.next = 11;
              return _database.Device.findOne({
                where: {
                  device_id: device_id
                }
              });

            case 11:
              device = _context.sent;
              _context.next = 17;
              break;

            case 14:
              _context.prev = 14;
              _context.t0 = _context["catch"](2);
              error = _context.t0;

            case 17:
              res.locals.setResponse(error, {
                device: device
              });
              next();

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 14]]);
    }))();
  };
};
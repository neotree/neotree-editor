"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _database = require("../../database");

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
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);
              error = new Error("Failed to update device ".concat(_context.t0.message));

            case 11:
              res.locals.setResponse(error, {
                device: device
              });
              next();

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 8]]);
    }))();
  };
};
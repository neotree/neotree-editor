"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _database = require("../../database");
var _firebase = require("../../firebase");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var path = require('node:path');
var fs = require('node:fs');
function makeid() {
  var chars = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
  var result = '';
  for (var i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result.toUpperCase();
}
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var deviceId, done, device, info;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            deviceId = req.query.deviceId;
            fs.appendFile(path.resolve('logs/getDeviceMiddleware.txt'), JSON.stringify(req.query, null, 4) + '\n\n', function () {});
            done = function done(e, payload) {
              fs.appendFile(path.resolve('logs/getDeviceMiddleware.txt'), JSON.stringify({
                error: e ? e.message : null,
                payload: payload
              }, null, 4) + '\n\n', function () {});
              res.locals.setResponse(e, payload);
              next();
            };
            if (deviceId) {
              _context.next = 5;
              break;
            }
            return _context.abrupt("return", done(new Error('"deviceId" is not provided')));
          case 5:
            device = null;
            info = null;
            _context.prev = 7;
            _context.next = 10;
            return _database.Device.findOrCreate({
              where: {
                device_id: deviceId
              },
              defaults: {
                device_id: deviceId,
                device_hash: makeid(deviceId),
                details: JSON.stringify({
                  scripts_count: 0
                })
              }
            });
          case 10:
            device = _context.sent;
            device = device ? device[0] : null;
            _context.next = 14;
            return _database.App.findAll({
              where: {}
            });
          case 14:
            info = _context.sent;
            info = info ? info[0] : null;
            _context.next = 20;
            break;
          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](7);
          case 20:
            _context.prev = 20;
            _context.next = 23;
            return _firebase.firebaseAdmin.database().ref("devices/".concat(deviceId)).set(device);
          case 23:
            _context.next = 27;
            break;
          case 25:
            _context.prev = 25;
            _context.t1 = _context["catch"](20);
          case 27:
            done(null, {
              device: device,
              info: info
            });
          case 28:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[7, 18], [20, 25]]);
    }))();
  };
};
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(makeid, "makeid", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/devices/getDeviceMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _models = require("../../models");

var _firebase = require("../../firebase");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

function makeid() {
  var chars = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
  var result = '';

  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result.toUpperCase();
}

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var deviceId, done, device;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              deviceId = req.query.deviceId;

              done = function done(e, payload) {
                res.locals.setResponse(e, payload);
                next();
              };

              if (deviceId) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", done(new Error('"deviceId" is not provided')));

            case 4:
              device = null;
              _context.prev = 5;
              _context.next = 8;
              return _models.Device.findOrCreate({
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

            case 8:
              device = _context.sent;
              device = device ? device[0] : null;
              _context.next = 14;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](5);

            case 14:
              _context.prev = 14;
              _context.next = 17;
              return _firebase.firebaseAdmin.database().ref("devices/".concat(deviceId)).set(device);

            case 17:
              _context.next = 21;
              break;

            case 19:
              _context.prev = 19;
              _context.t1 = _context["catch"](14);

            case 21:
              done(null, {
                device: device
              });

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 12], [14, 19]]);
    }))();
  };
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(makeid, "makeid", "/home/farai/WorkBench/neotree-editor/_server/routes/devices/getDeviceMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
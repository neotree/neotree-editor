"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyConfigKey = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyConfigKey = function copyConfigKey(_ref) {
  var id = _ref.configKeyId;
  return new Promise(function (resolve, reject) {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var configKeyId, snap, configKey, configKeys;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              configKeyId = null;
              _context.prev = 1;
              _context.next = 4;
              return _firebase["default"].database().ref('configkeys').push();

            case 4:
              snap = _context.sent;
              configKeyId = snap.key;
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", reject(_context.t0));

            case 11:
              configKey = null;
              _context.prev = 12;
              _context.next = 15;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("configkeys/".concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 15:
              configKey = _context.sent;
              _context.next = 20;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](12);

            case 20:
              if (configKey) {
                _context.next = 22;
                break;
              }

              return _context.abrupt("return", reject(new Error("ConfigKey with id \"".concat(id, "\" not found"))));

            case 22:
              configKeys = {};
              _context.prev = 23;
              _context.next = 26;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref('configkeys').on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 26:
              configKeys = _context.sent;
              _context.next = 31;
              break;

            case 29:
              _context.prev = 29;
              _context.t2 = _context["catch"](23);

            case 31:
              configKey = _objectSpread(_objectSpread({}, configKey), {}, {
                configKeyId: configKeyId,
                id: configKeyId,
                position: Object.keys(configKeys).length + 1
              });
              _context.prev = 32;
              _context.next = 35;
              return _firebase["default"].database().ref("configkeys/".concat(configKeyId)).set(_objectSpread(_objectSpread({}, configKey), {}, {
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }));

            case 35:
              _context.next = 40;
              break;

            case 37:
              _context.prev = 37;
              _context.t3 = _context["catch"](32);
              return _context.abrupt("return", reject(_context.t3));

            case 40:
              resolve(configKey);

            case 41:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 8], [12, 18], [23, 29], [32, 37]]);
    }))();
  });
};

exports.copyConfigKey = copyConfigKey;

var _default = function _default(app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var configKeys, done, rslts;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              configKeys = req.body.configKeys;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                if (rslts.length) app.io.emit('create_config_keys', {
                  key: app.getRandomString(),
                  configKeys: configKeys
                });
                res.locals.setResponse(err, {
                  configKeys: rslts
                });
                next();
              };

              rslts = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(configKeys.map(function (s) {
                return copyConfigKey(s);
              }));

            case 6:
              rslts = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, rslts);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 9]]);
    }))();
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyConfigKey, "copyConfigKey", "/home/farai/WorkBench/neotree-editor/server/routes/config-keys/duplicateConfigKeysMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/config-keys/duplicateConfigKeysMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
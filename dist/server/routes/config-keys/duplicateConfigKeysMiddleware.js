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
var _models = require("../../database/models");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var copyConfigKey = function copyConfigKey(_ref) {
  var id = _ref.id;
  return new Promise(function (resolve, reject) {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var configKeyId, snap, configKey, configKeysCount, screens, snaps, diagnoses, _snaps, savedConfigKey, savedScreens, savedDiagnoses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            configKeyId = null;
            _context.prev = 1;
            _context.next = 4;
            return _firebase["default"].database().ref('configKeys').push();
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
            return _models.ConfigKey.findOne({
              where: {
                id: id
              }
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
            configKey = JSON.parse(JSON.stringify(configKey));
            configKeysCount = 0;
            _context.prev = 24;
            _context.next = 27;
            return _models.ConfigKey.count({
              where: {}
            });
          case 27:
            configKeysCount = _context.sent;
            _context.next = 32;
            break;
          case 30:
            _context.prev = 30;
            _context.t2 = _context["catch"](24);
          case 32:
            screens = [];
            _context.prev = 33;
            _context.next = 36;
            return _models.Screen.findAll({
              where: {
                config_key_id: configKey.config_key_id,
                deletedAt: null
              },
              order: [['position', 'ASC']]
            });
          case 36:
            screens = _context.sent;
            _context.next = 39;
            return Promise.all(screens.map(function () {
              return _firebase["default"].database().ref("screens/".concat(configKeyId)).push();
            }));
          case 39:
            snaps = _context.sent;
            screens = screens.map(function (s, i) {
              s = JSON.parse(JSON.stringify(s));
              delete s.id;
              return _objectSpread(_objectSpread({}, s), {}, {
                config_key_id: configKeyId,
                screen_id: snaps[i].key,
                data: JSON.stringify(_objectSpread(_objectSpread({}, s.data), {}, {
                  configKeyId: configKeyId,
                  screenId: snaps[i].key,
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }))
              });
            });
            _context.next = 45;
            break;
          case 43:
            _context.prev = 43;
            _context.t3 = _context["catch"](33);
          case 45:
            diagnoses = [];
            _context.prev = 46;
            _context.next = 49;
            return _models.Diagnosis.findAll({
              where: {
                config_key_id: configKey.config_key_id,
                deletedAt: null
              },
              order: [['position', 'ASC']]
            });
          case 49:
            diagnoses = _context.sent;
            _context.next = 52;
            return Promise.all(diagnoses.map(function () {
              return _firebase["default"].database().ref("diagnosis/".concat(configKeyId)).push();
            }));
          case 52:
            _snaps = _context.sent;
            diagnoses = diagnoses.map(function (d, i) {
              d = JSON.parse(JSON.stringify(d));
              delete d.id;
              return _objectSpread(_objectSpread({}, d), {}, {
                config_key_id: configKeyId,
                diagnosis_id: _snaps[i].key,
                data: JSON.stringify(_objectSpread(_objectSpread({}, d.data), {}, {
                  configKeyId: configKeyId,
                  diagnosisId: _snaps[i].key,
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }))
              });
            });
            _context.next = 58;
            break;
          case 56:
            _context.prev = 56;
            _context.t4 = _context["catch"](46);
          case 58:
            delete configKey.id;
            configKey = _objectSpread(_objectSpread({}, configKey), {}, {
              config_key_id: configKeyId,
              position: configKeysCount + 1,
              data: JSON.stringify(_objectSpread(_objectSpread({}, configKey.data), {}, {
                configKeyId: configKeyId,
                position: configKeysCount + 1,
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }))
            });
            savedConfigKey = null;
            _context.prev = 61;
            _context.next = 64;
            return _models.ConfigKey.findOrCreate({
              where: {
                config_key_id: configKey.config_key_id
              },
              defaults: _objectSpread({}, configKey)
            });
          case 64:
            savedConfigKey = _context.sent;
            _context.next = 70;
            break;
          case 67:
            _context.prev = 67;
            _context.t5 = _context["catch"](61);
            return _context.abrupt("return", reject(_context.t5));
          case 70:
            savedScreens = [];
            _context.prev = 71;
            _context.next = 74;
            return Promise.all(screens.map(function (s) {
              return _models.Screen.findOrCreate({
                where: {
                  screen_id: s.screen_id
                },
                defaults: _objectSpread({}, s)
              });
            }));
          case 74:
            savedScreens = _context.sent;
            _context.next = 79;
            break;
          case 77:
            _context.prev = 77;
            _context.t6 = _context["catch"](71);
          case 79:
            savedDiagnoses = [];
            _context.prev = 80;
            _context.next = 83;
            return Promise.all(diagnoses.map(function (d) {
              return _models.Diagnosis.findOrCreate({
                where: {
                  diagnosis_id: d.diagnosis_id
                },
                defaults: _objectSpread({}, d)
              });
            }));
          case 83:
            savedDiagnoses = _context.sent;
            _context.next = 88;
            break;
          case 86:
            _context.prev = 86;
            _context.t7 = _context["catch"](80);
          case 88:
            resolve({
              configKey: savedConfigKey,
              diagnoses: savedScreens,
              screens: savedDiagnoses
            });
          case 89:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8], [12, 18], [24, 30], [33, 43], [46, 56], [61, 67], [71, 77], [80, 86]]);
    }))();
  });
};
exports.copyConfigKey = copyConfigKey;
var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var configKeys, done, rslts;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            configKeys = req.body.configKeys;
            done = /*#__PURE__*/function () {
              var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(err) {
                var rslts,
                  _args2 = arguments;
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      rslts = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : [];
                      res.locals.setResponse(err, {
                        configKeys: rslts.map(function (_ref5) {
                          var configKey = _ref5.configKey;
                          return configKey;
                        })
                      });
                      next();
                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              }));
              return function done(_x) {
                return _ref4.apply(this, arguments);
              };
            }();
            rslts = [];
            _context3.prev = 3;
            _context3.next = 6;
            return Promise.all(configKeys.map(function (s) {
              return copyConfigKey(s);
            }));
          case 6:
            rslts = _context3.sent;
            _context3.next = 12;
            break;
          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](3);
            return _context3.abrupt("return", done(_context3.t0));
          case 12:
            done(null, rslts);
          case 13:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[3, 9]]);
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
  reactHotLoader.register(copyConfigKey, "copyConfigKey", "/home/farai/Workbench/neotree-editor/server/routes/config-keys/duplicateConfigKeysMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/routes/config-keys/duplicateConfigKeysMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
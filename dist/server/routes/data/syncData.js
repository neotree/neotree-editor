"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var _database = require("../../database");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _req$query, _lastSyncDate, deviceId, scriptsCount, mode, lastSyncDate, done, webeditorInfo, device, details, scripts, screens, diagnoses, configKeys, deletedScripts, deletedScreens, deletedDiagnoses, deletedConfigKeys, backUpFolderExists, readDir, whereLastSyncDateGreaterThanLastUpdated, whereLastSyncDateGreaterThanLastDeleted;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _req$query = req.query, _lastSyncDate = _req$query.lastSyncDate, deviceId = _req$query.deviceId, scriptsCount = _req$query.scriptsCount, mode = _req$query.mode;
            lastSyncDate = _lastSyncDate ? new Date(_lastSyncDate).getTime() : null;
            done = function done(e, payload) {
              res.locals.setResponse(e, payload);
              next();
            };
            _context2.next = 5;
            return _database.App.findAll({
              where: {}
            });
          case 5:
            webeditorInfo = _context2.sent;
            webeditorInfo = webeditorInfo ? webeditorInfo[0] : null;
            device = null;
            if (!deviceId) {
              _context2.next = 34;
              break;
            }
            _context2.prev = 9;
            _context2.next = 12;
            return _database.Device.findOne({
              where: {
                device_id: deviceId
              }
            });
          case 12:
            device = _context2.sent;
            _context2.next = 17;
            break;
          case 15:
            _context2.prev = 15;
            _context2.t0 = _context2["catch"](9);
          case 17:
            if (!(device && scriptsCount && scriptsCount !== device.details.scripts_count)) {
              _context2.next = 34;
              break;
            }
            details = JSON.stringify(_objectSpread(_objectSpread({}, device.details), {}, {
              scripts_count: scriptsCount
            }));
            _context2.prev = 19;
            _context2.next = 22;
            return _database.Device.update({
              details: details
            }, {
              where: {
                device_id: deviceId
              }
            });
          case 22:
            _context2.next = 26;
            break;
          case 24:
            _context2.prev = 24;
            _context2.t1 = _context2["catch"](19);
          case 26:
            _context2.prev = 26;
            _context2.next = 29;
            return _database.Device.findOne({
              where: {
                device_id: deviceId
              }
            });
          case 29:
            device = _context2.sent;
            _context2.next = 34;
            break;
          case 32:
            _context2.prev = 32;
            _context2.t2 = _context2["catch"](26);
          case 34:
            _context2.prev = 34;
            scripts = [];
            screens = [];
            diagnoses = [];
            configKeys = [];
            deletedScripts = [];
            deletedScreens = [];
            deletedDiagnoses = [];
            deletedConfigKeys = [];
            backUpFolderExists = _fs["default"].existsSync(process.env.BACKUP_DIR_PATH);
            if (!(backUpFolderExists && mode === 'production')) {
              _context2.next = 60;
              break;
            }
            readDir = function readDir(dir) {
              return new Promise(function (resolve, reject) {
                (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                  var files;
                  return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) switch (_context.prev = _context.next) {
                      case 0:
                        dir = "".concat(process.env.BACKUP_DIR_PATH, "/").concat(dir);
                        _context.prev = 1;
                        if (_fs["default"].existsSync(process.env.BACKUP_DIR_PATH)) {
                          _context.next = 4;
                          break;
                        }
                        return _context.abrupt("return", reject(new Error('Backup directory not found')));
                      case 4:
                        _context.next = 6;
                        return Promise.all(_fs["default"].readdirSync(dir).map(function (fname) {
                          return new Promise(function (resolve) {
                            var data = _fs["default"].readFileSync("".concat(dir, "/").concat(fname));
                            resolve(JSON.parse(data));
                          });
                        }));
                      case 6:
                        files = _context.sent;
                        resolve(files.sort(function (a, b) {
                          return a.id - b.id;
                        }));
                        _context.next = 13;
                        break;
                      case 10:
                        _context.prev = 10;
                        _context.t0 = _context["catch"](1);
                        return _context.abrupt("return", reject(_context.t0));
                      case 13:
                      case "end":
                        return _context.stop();
                    }
                  }, _callee, null, [[1, 10]]);
                }))();
              });
            };
            _context2.next = 48;
            return readDir('scripts');
          case 48:
            scripts = _context2.sent;
            _context2.next = 51;
            return readDir('screens');
          case 51:
            screens = _context2.sent;
            _context2.next = 54;
            return readDir('diagnoses');
          case 54:
            diagnoses = _context2.sent;
            _context2.next = 57;
            return readDir('configKeys');
          case 57:
            configKeys = _context2.sent;
            _context2.next = 86;
            break;
          case 60:
            whereLastSyncDateGreaterThanLastUpdated = !lastSyncDate ? {} : {
              updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
            };
            whereLastSyncDateGreaterThanLastDeleted = !lastSyncDate ? {} : {
              deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
            };
            _context2.next = 64;
            return _database.Script.findAll({
              where: _objectSpread({
                deletedAt: null
              }, whereLastSyncDateGreaterThanLastUpdated)
            });
          case 64:
            scripts = _context2.sent;
            _context2.next = 67;
            return _database.Script.findAll({
              where: _objectSpread({
                deletedAt: {
                  $not: null
                }
              }, whereLastSyncDateGreaterThanLastDeleted)
            });
          case 67:
            deletedScripts = _context2.sent;
            _context2.next = 70;
            return _database.Screen.findAll({
              where: _objectSpread({
                deletedAt: null
              }, whereLastSyncDateGreaterThanLastUpdated)
            });
          case 70:
            screens = _context2.sent;
            _context2.next = 73;
            return _database.Screen.findAll({
              where: _objectSpread({
                deletedAt: {
                  $not: null
                }
              }, whereLastSyncDateGreaterThanLastDeleted)
            });
          case 73:
            deletedScreens = _context2.sent;
            _context2.next = 76;
            return _database.Diagnosis.findAll({
              where: _objectSpread({
                deletedAt: null
              }, whereLastSyncDateGreaterThanLastUpdated)
            });
          case 76:
            diagnoses = _context2.sent;
            _context2.next = 79;
            return _database.Diagnosis.findAll({
              where: _objectSpread({
                deletedAt: {
                  $not: null
                }
              }, whereLastSyncDateGreaterThanLastDeleted)
            });
          case 79:
            deletedDiagnoses = _context2.sent;
            _context2.next = 82;
            return _database.ConfigKey.findAll({
              where: _objectSpread({
                deletedAt: null
              }, whereLastSyncDateGreaterThanLastUpdated)
            });
          case 82:
            configKeys = _context2.sent;
            _context2.next = 85;
            return _database.ConfigKey.findAll({
              where: _objectSpread({
                deletedAt: {
                  $not: null
                }
              }, whereLastSyncDateGreaterThanLastDeleted)
            });
          case 85:
            deletedConfigKeys = _context2.sent;
          case 86:
            done(null, {
              webeditorInfo: webeditorInfo,
              device: device,
              scripts: scripts,
              deletedScripts: deletedScripts,
              screens: screens,
              deletedScreens: deletedScreens,
              diagnoses: diagnoses,
              deletedDiagnoses: deletedDiagnoses,
              configKeys: configKeys,
              deletedConfigKeys: deletedConfigKeys
            });
            _context2.next = 92;
            break;
          case 89:
            _context2.prev = 89;
            _context2.t3 = _context2["catch"](34);
            done(_context2.t3);
          case 92:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[9, 15], [19, 24], [26, 32], [34, 89]]);
    }))();
  };
};
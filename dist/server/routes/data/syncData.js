"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _sequelize = require("sequelize");

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _req$query, _lastSyncDate, deviceId, scriptsCount, mode, lastSyncDate, done, device, details, scripts, screens, diagnoses, configKeys, deletedScripts, deletedScreens, deletedDiagnoses, deletedConfigKeys, backUpFolderExists, readDir, whereLastSyncDateGreaterThanLastUpdated, whereLastSyncDateGreaterThanLastDeleted;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _req$query = req.query, _lastSyncDate = _req$query.lastSyncDate, deviceId = _req$query.deviceId, scriptsCount = _req$query.scriptsCount, mode = _req$query.mode;
              lastSyncDate = _lastSyncDate ? new Date(_lastSyncDate).getTime() : null;

              done = function done(e, payload) {
                res.locals.setResponse(e, payload);
                next();
              };

              device = null;

              if (!deviceId) {
                _context2.next = 30;
                break;
              }

              _context2.prev = 5;
              _context2.next = 8;
              return _database.Device.findOne({
                where: {
                  device_id: deviceId
                }
              });

            case 8:
              device = _context2.sent;
              _context2.next = 13;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](5);

            case 13:
              if (!(device && scriptsCount && scriptsCount !== device.details.scripts_count)) {
                _context2.next = 30;
                break;
              }

              details = JSON.stringify(_objectSpread(_objectSpread({}, device.details), {}, {
                scripts_count: scriptsCount
              }));
              _context2.prev = 15;
              _context2.next = 18;
              return _database.Device.update({
                details: details
              }, {
                where: {
                  device_id: deviceId
                }
              });

            case 18:
              _context2.next = 22;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t1 = _context2["catch"](15);

            case 22:
              _context2.prev = 22;
              _context2.next = 25;
              return _database.Device.findOne({
                where: {
                  device_id: deviceId
                }
              });

            case 25:
              device = _context2.sent;
              _context2.next = 30;
              break;

            case 28:
              _context2.prev = 28;
              _context2.t2 = _context2["catch"](22);

            case 30:
              _context2.prev = 30;
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
                _context2.next = 56;
                break;
              }

              readDir = function readDir(dir) {
                return new Promise(function (resolve, reject) {
                  (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                    var files;
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
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
                      }
                    }, _callee, null, [[1, 10]]);
                  }))();
                });
              };

              _context2.next = 44;
              return readDir('scripts');

            case 44:
              scripts = _context2.sent;
              _context2.next = 47;
              return readDir('screens');

            case 47:
              screens = _context2.sent;
              _context2.next = 50;
              return readDir('diagnoses');

            case 50:
              diagnoses = _context2.sent;
              _context2.next = 53;
              return readDir('configKeys');

            case 53:
              configKeys = _context2.sent;
              _context2.next = 82;
              break;

            case 56:
              whereLastSyncDateGreaterThanLastUpdated = !lastSyncDate ? {} : {
                updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
              };
              whereLastSyncDateGreaterThanLastDeleted = !lastSyncDate ? {} : {
                deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
              };
              _context2.next = 60;
              return _database.Script.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              });

            case 60:
              scripts = _context2.sent;
              _context2.next = 63;
              return _database.Script.findAll({
                where: _objectSpread({
                  deletedAt: {
                    $not: null
                  }
                }, whereLastSyncDateGreaterThanLastDeleted)
              });

            case 63:
              deletedScripts = _context2.sent;
              _context2.next = 66;
              return _database.Screen.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              });

            case 66:
              screens = _context2.sent;
              _context2.next = 69;
              return _database.Screen.findAll({
                where: _objectSpread({
                  deletedAt: {
                    $not: null
                  }
                }, whereLastSyncDateGreaterThanLastDeleted)
              });

            case 69:
              deletedScreens = _context2.sent;
              _context2.next = 72;
              return _database.Diagnosis.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              });

            case 72:
              diagnoses = _context2.sent;
              _context2.next = 75;
              return _database.Diagnosis.findAll({
                where: _objectSpread({
                  deletedAt: {
                    $not: null
                  }
                }, whereLastSyncDateGreaterThanLastDeleted)
              });

            case 75:
              deletedDiagnoses = _context2.sent;
              _context2.next = 78;
              return _database.ConfigKey.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              });

            case 78:
              configKeys = _context2.sent;
              _context2.next = 81;
              return _database.ConfigKey.findAll({
                where: _objectSpread({
                  deletedAt: {
                    $not: null
                  }
                }, whereLastSyncDateGreaterThanLastDeleted)
              });

            case 81:
              deletedConfigKeys = _context2.sent;

            case 82:
              done(null, {
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
              _context2.next = 88;
              break;

            case 85:
              _context2.prev = 85;
              _context2.t3 = _context2["catch"](30);
              done(_context2.t3);

            case 88:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[5, 11], [15, 20], [22, 28], [30, 85]]);
    }))();
  };
};
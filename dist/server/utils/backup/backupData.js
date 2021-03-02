"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = backupData;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _sequelize = require("sequelize");

var _child_process = require("child_process");

var database = _interopRequireWildcard(require("../../database"));

var _shouldBackup2 = _interopRequireDefault(require("./shouldBackup"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

function backupData() {
  return new Promise(function (resolve, reject) {
    try {
      if (!_fs["default"].existsSync(process.env.BACKUP_DIR_PATH)) return reject(new Error('Backup directory not found'));
    } catch (e) {
      return reject(e);
    }

    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var _shouldBackup, lastBackUpDetails, appInfo, whereLastUpdated, scripts, screens, diagnoses, configKeys, hospitals, readDir, writeData, whereLastDeleted, deletedScripts, deletedScreens, deletedDiagnoses, deletedConfigKeys, deletedHospitals, deleteData, rslts;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return (0, _shouldBackup2["default"])();

            case 3:
              _shouldBackup = _context3.sent;

              if (!_shouldBackup) {
                _context3.next = 66;
                break;
              }

              lastBackUpDetails = _fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) ? _fs["default"].readFileSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) : JSON.stringify({});
              lastBackUpDetails = JSON.parse(lastBackUpDetails);
              _context3.next = 9;
              return database.App.findOne({
                where: {
                  id: 1
                },
                limit: 1
              });

            case 9:
              appInfo = _context3.sent;
              appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
              appInfo = _objectSpread({}, appInfo);
              whereLastUpdated = !lastBackUpDetails.last_backup_date ? {} : {
                updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastBackUpDetails.last_backup_date),
                deletedAt: null
              };
              _context3.next = 15;
              return database.Script.findAll({
                where: whereLastUpdated
              });

            case 15:
              scripts = _context3.sent;
              _context3.next = 18;
              return database.Screen.findAll({
                where: whereLastUpdated
              });

            case 18:
              screens = _context3.sent;
              _context3.next = 21;
              return database.Diagnosis.findAll({
                where: whereLastUpdated
              });

            case 21:
              diagnoses = _context3.sent;
              _context3.next = 24;
              return database.ConfigKey.findAll({
                where: whereLastUpdated
              });

            case 24:
              configKeys = _context3.sent;
              _context3.next = 27;
              return database.Hospital.findAll({
                where: whereLastUpdated
              });

            case 27:
              hospitals = _context3.sent;

              // const files = await database.File.findAll({ where: whereLastUpdated });
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

              writeData = function writeData() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var folder = arguments.length > 1 ? arguments[1] : undefined;
                return data.map(function (item) {
                  return new Promise(function (resolve, reject) {
                    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                      var files;
                      return _regenerator["default"].wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (!_fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder))) _fs["default"].mkdirSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder));
                              _context2.prev = 1;

                              _fs["default"].writeFileSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder, "/").concat(item.id, ".json"), JSON.stringify(item));

                              _context2.next = 8;
                              break;

                            case 5:
                              _context2.prev = 5;
                              _context2.t0 = _context2["catch"](1);
                              return _context2.abrupt("return", reject(_context2.t0));

                            case 8:
                              _context2.prev = 8;
                              _context2.next = 11;
                              return readDir(folder);

                            case 11:
                              files = _context2.sent;
                              files.filter(function (f) {
                                return f.deletedAt;
                              }).forEach(function (f) {
                                return _fs["default"].unlinkSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder, "/").concat(f.id, ".json"));
                              });
                              _context2.next = 17;
                              break;

                            case 15:
                              _context2.prev = 15;
                              _context2.t1 = _context2["catch"](8);

                            case 17:
                              resolve();

                            case 18:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2, null, [[1, 5], [8, 15]]);
                    }))();
                  });
                });
              };

              _context3.next = 32;
              return Promise.all(Object.assign([], writeData(scripts, 'scripts'), writeData(screens, 'screens'), writeData(diagnoses, 'diagnoses'), writeData(configKeys, 'configKeys'), writeData(hospitals, 'hospitals') // writeData(files, 'files')
              ));

            case 32:
              if (!lastBackUpDetails.last_backup_date) {
                _context3.next = 52;
                break;
              }

              whereLastDeleted = {
                deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastBackUpDetails.last_backup_date)
              };
              _context3.next = 36;
              return database.Script.findAll({
                where: whereLastDeleted
              });

            case 36:
              deletedScripts = _context3.sent;
              _context3.next = 39;
              return database.Screen.findAll({
                where: whereLastDeleted
              });

            case 39:
              deletedScreens = _context3.sent;
              _context3.next = 42;
              return database.Diagnosis.findAll({
                where: whereLastDeleted
              });

            case 42:
              deletedDiagnoses = _context3.sent;
              _context3.next = 45;
              return database.ConfigKey.findAll({
                where: whereLastDeleted
              });

            case 45:
              deletedConfigKeys = _context3.sent;
              _context3.next = 48;
              return database.Hospital.findAll({
                where: whereLastDeleted
              });

            case 48:
              deletedHospitals = _context3.sent;

              // const deletedFiles = await database.File.findAll({ where: whereLastDeleted });
              deleteData = function deleteData() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var folder = arguments.length > 1 ? arguments[1] : undefined;
                return data.map(function (item) {
                  return new Promise(function (resolve, reject) {
                    if (!_fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder))) _fs["default"].mkdirSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder));

                    try {
                      _fs["default"].unlinkSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder, "/").concat(item.id, ".json"));

                      resolve();
                    } catch (e) {
                      reject(e);
                    }
                  });
                });
              };

              _context3.next = 52;
              return Promise.all(Object.assign([], deleteData(deletedScripts, 'scripts'), deleteData(deletedScreens, 'screens'), deleteData(deletedDiagnoses, 'diagnoses'), deleteData(deletedConfigKeys, 'configKeys'), deleteData(deletedHospitals, 'hospitals') // deleteData(deletedFiles, 'files')
              ));

            case 52:
              rslts = null;
              appInfo = _objectSpread(_objectSpread({}, appInfo), {}, {
                last_backup_date: new Date(),
                version: (appInfo.version || 0) + 1
              });

              if (!(appInfo.id !== 1)) {
                _context3.next = 61;
                break;
              }

              _context3.next = 57;
              return database.App.findOrCreate({
                where: {
                  id: 1
                },
                defaults: appInfo
              });

            case 57:
              rslts = _context3.sent;
              appInfo = JSON.parse(JSON.stringify(rslts[0]));
              _context3.next = 64;
              break;

            case 61:
              _context3.next = 63;
              return database.App.update(appInfo, {
                where: {
                  id: 1
                }
              });

            case 63:
              rslts = _context3.sent;

            case 64:
              _fs["default"].writeFileSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json"), JSON.stringify(appInfo));

              (0, _child_process.exec)("cd ".concat(process.env.BACKUP_DIR_PATH, " && git add . && git commit -m v").concat(appInfo.version, " && git push origin master"), function (error, stdout, stderr) {
                if (error) {
                  console.log("error: ".concat(error.message));
                  return;
                }

                if (stderr) {
                  console.log("stderr: ".concat(stderr));
                  return;
                }

                console.log("stdout: ".concat(stdout));
              });

            case 66:
              resolve();
              _context3.next = 72;
              break;

            case 69:
              _context3.prev = 69;
              _context3.t0 = _context3["catch"](0);
              reject(_context3.t0);

            case 72:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 69]]);
    }))();
  });
}

;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(backupData, "backupData", "/home/farai/WorkBench/neotree-editor/server/utils/backup/backupData.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
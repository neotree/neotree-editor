"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = backupData;
exports.shouldBackup = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _sequelize = require("sequelize");

var _child_process = require("child_process");

var database = _interopRequireWildcard(require("../database"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var shouldBackup = function shouldBackup() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var appInfo, whereLastUpdated, countScripts, countScreens, countDiagnoses, countConfigKeys, countHospitals, whereLastDeleted, countDeletedScripts, countDeletedScreens, countDeletedDiagnoses, countDeletedConfigKeys, countDeletedHospitals;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              appInfo = null;
              _context.next = 4;
              return database.App.findOne({
                where: {
                  id: 1
                }
              });

            case 4:
              appInfo = _context.sent;
              appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));

              if (appInfo) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", resolve(true));

            case 8:
              whereLastUpdated = !appInfo.last_backup_date ? {} : {
                updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, appInfo.last_backup_date),
                deletedAt: null
              };
              _context.next = 11;
              return database.Script.count({
                where: whereLastUpdated
              });

            case 11:
              countScripts = _context.sent;
              _context.next = 14;
              return database.Screen.count({
                where: whereLastUpdated
              });

            case 14:
              countScreens = _context.sent;
              _context.next = 17;
              return database.Diagnosis.count({
                where: whereLastUpdated
              });

            case 17:
              countDiagnoses = _context.sent;
              _context.next = 20;
              return database.ConfigKey.count({
                where: whereLastUpdated
              });

            case 20:
              countConfigKeys = _context.sent;
              _context.next = 23;
              return database.Hospital.count({
                where: whereLastUpdated
              });

            case 23:
              countHospitals = _context.sent;
              whereLastDeleted = !appInfo.last_backup_date ? {} : {
                deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, appInfo.last_backup_date)
              };
              _context.next = 27;
              return database.Script.count({
                where: whereLastDeleted
              });

            case 27:
              countDeletedScripts = _context.sent;
              _context.next = 30;
              return database.Screen.count({
                where: whereLastDeleted
              });

            case 30:
              countDeletedScreens = _context.sent;
              _context.next = 33;
              return database.Diagnosis.count({
                where: whereLastDeleted
              });

            case 33:
              countDeletedDiagnoses = _context.sent;
              _context.next = 36;
              return database.ConfigKey.count({
                where: whereLastDeleted
              });

            case 36:
              countDeletedConfigKeys = _context.sent;
              _context.next = 39;
              return database.Hospital.count({
                where: whereLastDeleted
              });

            case 39:
              countDeletedHospitals = _context.sent;
              resolve(!!(countScripts || countScreens || countDiagnoses || countConfigKeys || countHospitals || countDeletedScripts || countDeletedScreens || countDeletedDiagnoses || countDeletedConfigKeys || countDeletedHospitals));
              _context.next = 46;
              break;

            case 43:
              _context.prev = 43;
              _context.t0 = _context["catch"](0);
              reject(_context.t0);

            case 46:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 43]]);
    }))();
  });
};

exports.shouldBackup = shouldBackup;

function backupData(app) {
  var io = app.io;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _shouldBackup, dataDirPath, dir, dataDir, lastBackUpDetails, appInfo, whereLastUpdated, scripts, screens, diagnoses, configKeys, hospitals, writeData, whereLastDeleted, deletedScripts, deletedScreens, deletedDiagnoses, deletedConfigKeys, deletedHospitals, deleteData, rslts;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return shouldBackup();

            case 3:
              _shouldBackup = _context2.sent;

              if (!_shouldBackup) {
                _context2.next = 68;
                break;
              }

              dataDirPath = "".concat(process.env.BACKUP_DIR_PATH, "/").concat(process.env.APP_ENV);
              dir = _fs["default"].readdirSync(process.env.BACKUP_DIR_PATH);
              dataDir = dir.filter(function (n) {
                return n === process.env.APP_ENV;
              })[0];
              lastBackUpDetails = !dataDir ? {} : _fs["default"].readFileSync("".concat(dataDirPath, "/app.json"));
              _context2.next = 11;
              return database.App.findOne({
                where: {
                  id: 1
                },
                limit: 1
              });

            case 11:
              appInfo = _context2.sent;
              appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
              appInfo = _objectSpread({}, appInfo);
              if (!dataDir) _fs["default"].mkdirSync(dataDirPath);
              whereLastUpdated = !lastBackUpDetails.last_backup_date ? {} : {
                updatedAt: {
                  $gt: lastBackUpDetails.last_backup_date
                },
                deletedAt: null
              };
              _context2.next = 18;
              return database.Script.findAll({
                where: whereLastUpdated
              });

            case 18:
              scripts = _context2.sent;
              _context2.next = 21;
              return database.Screen.findAll({
                where: whereLastUpdated
              });

            case 21:
              screens = _context2.sent;
              _context2.next = 24;
              return database.Diagnosis.findAll({
                where: whereLastUpdated
              });

            case 24:
              diagnoses = _context2.sent;
              _context2.next = 27;
              return database.ConfigKey.findAll({
                where: whereLastUpdated
              });

            case 27:
              configKeys = _context2.sent;
              _context2.next = 30;
              return database.Hospital.findAll({
                where: whereLastUpdated
              });

            case 30:
              hospitals = _context2.sent;

              // const files = await database.File.findAll({ where: whereLastUpdated });
              writeData = function writeData() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var folder = arguments.length > 1 ? arguments[1] : undefined;
                return data.map(function (item) {
                  return new Promise(function (resolve, reject) {
                    if (!_fs["default"].existsSync("".concat(dataDirPath, "/").concat(folder))) _fs["default"].mkdirSync("".concat(dataDirPath, "/").concat(folder));

                    try {
                      _fs["default"].writeFileSync("".concat(dataDirPath, "/").concat(folder, "/").concat(item.id, ".json"), JSON.stringify(item));

                      resolve();
                    } catch (e) {
                      reject(e);
                    }
                  });
                });
              };

              _context2.next = 34;
              return Promise.all(Object.assign([], writeData(scripts, 'scripts'), writeData(screens, 'screens'), writeData(diagnoses, 'diagnoses'), writeData(configKeys, 'configKeys'), writeData(hospitals, 'hospitals') // writeData(files, 'files')
              ));

            case 34:
              whereLastDeleted = !lastBackUpDetails.last_backup_date ? {} : {
                deletedAt: {
                  $gt: lastBackUpDetails.last_backup_date
                }
              };
              _context2.next = 37;
              return database.Script.findAll({
                where: whereLastDeleted
              });

            case 37:
              deletedScripts = _context2.sent;
              _context2.next = 40;
              return database.Screen.findAll({
                where: whereLastDeleted
              });

            case 40:
              deletedScreens = _context2.sent;
              _context2.next = 43;
              return database.Diagnosis.findAll({
                where: whereLastDeleted
              });

            case 43:
              deletedDiagnoses = _context2.sent;
              _context2.next = 46;
              return database.ConfigKey.findAll({
                where: whereLastDeleted
              });

            case 46:
              deletedConfigKeys = _context2.sent;
              _context2.next = 49;
              return database.Hospital.findAll({
                where: whereLastDeleted
              });

            case 49:
              deletedHospitals = _context2.sent;

              // const deletedFiles = await database.File.findAll({ where: whereLastDeleted });
              deleteData = function deleteData() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var folder = arguments.length > 1 ? arguments[1] : undefined;
                return data.map(function (item) {
                  return new Promise(function (resolve, reject) {
                    if (!_fs["default"].existsSync("".concat(dataDirPath, "/").concat(folder))) _fs["default"].mkdirSync("".concat(dataDirPath, "/").concat(folder));

                    try {
                      _fs["default"].unlinkSync("".concat(dataDirPath, "/").concat(folder, "/").concat(item.id, ".json"));

                      resolve();
                    } catch (e) {
                      reject(e);
                    }
                  });
                });
              };

              _context2.next = 53;
              return Promise.all(Object.assign([], deleteData(deletedScripts, 'scripts'), deleteData(deletedScreens, 'screens'), deleteData(deletedDiagnoses, 'diagnoses'), deleteData(deletedConfigKeys, 'configKeys'), deleteData(deletedHospitals, 'hospitals') // deleteData(deletedFiles, 'files')
              ));

            case 53:
              rslts = null;
              appInfo = _objectSpread(_objectSpread({}, appInfo), {}, {
                last_backup_date: new Date(),
                version: (appInfo.version || 0) + 1
              });

              if (!(appInfo.id !== 1)) {
                _context2.next = 62;
                break;
              }

              _context2.next = 58;
              return database.App.findOrCreate({
                where: {
                  id: 1
                },
                defaults: appInfo
              });

            case 58:
              rslts = _context2.sent;
              appInfo = JSON.parse(JSON.stringify(rslts[0]));
              _context2.next = 65;
              break;

            case 62:
              _context2.next = 64;
              return database.App.update(appInfo, {
                where: {
                  id: 1
                }
              });

            case 64:
              rslts = _context2.sent;

            case 65:
              _fs["default"].writeFileSync("".concat(dataDirPath, "/app.json"), JSON.stringify(appInfo));

              io.emit('data_published');
              (0, _child_process.exec)("cd ".concat(process.env.BACKUP_DIR_PATH, " && git add . && git commit -m ").concat(process.env.APP_ENV, "-v").concat(appInfo.version, " && git push"), function (error, stdout, stderr) {
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

            case 68:
              resolve();
              _context2.next = 74;
              break;

            case 71:
              _context2.prev = 71;
              _context2.t0 = _context2["catch"](0);
              reject(_context2.t0);

            case 74:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 71]]);
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

  reactHotLoader.register(shouldBackup, "shouldBackup", "/home/farai/WorkBench/neotree-editor/server/utils/backupData.js");
  reactHotLoader.register(backupData, "backupData", "/home/farai/WorkBench/neotree-editor/server/utils/backupData.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
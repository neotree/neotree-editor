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

    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _shouldBackup, lastBackUpDetails, appInfo, whereLastUpdated, scripts, screens, diagnoses, configKeys, hospitals, writeData, whereLastDeleted, deletedScripts, deletedScreens, deletedDiagnoses, deletedConfigKeys, deletedHospitals, deleteData, rslts;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return (0, _shouldBackup2["default"])();

            case 3:
              _shouldBackup = _context.sent;

              if (!_shouldBackup) {
                _context.next = 65;
                break;
              }

              lastBackUpDetails = _fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) ? _fs["default"].readFileSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) : JSON.stringify({});
              lastBackUpDetails = JSON.parse(lastBackUpDetails);
              _context.next = 9;
              return database.App.findOne({
                where: {
                  id: 1
                },
                limit: 1
              });

            case 9:
              appInfo = _context.sent;
              appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
              appInfo = _objectSpread({}, appInfo);
              whereLastUpdated = !lastBackUpDetails.last_backup_date ? {} : {
                updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastBackUpDetails.last_backup_date),
                deletedAt: null
              };
              _context.next = 15;
              return database.Script.findAll({
                where: whereLastUpdated
              });

            case 15:
              scripts = _context.sent;
              _context.next = 18;
              return database.Screen.findAll({
                where: whereLastUpdated
              });

            case 18:
              screens = _context.sent;
              _context.next = 21;
              return database.Diagnosis.findAll({
                where: whereLastUpdated
              });

            case 21:
              diagnoses = _context.sent;
              _context.next = 24;
              return database.ConfigKey.findAll({
                where: whereLastUpdated
              });

            case 24:
              configKeys = _context.sent;
              _context.next = 27;
              return database.Hospital.findAll({
                where: whereLastUpdated
              });

            case 27:
              hospitals = _context.sent;

              // const files = await database.File.findAll({ where: whereLastUpdated });
              writeData = function writeData() {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var folder = arguments.length > 1 ? arguments[1] : undefined;
                return data.map(function (item) {
                  return new Promise(function (resolve, reject) {
                    if (!_fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder))) _fs["default"].mkdirSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder));

                    try {
                      _fs["default"].writeFileSync("".concat(process.env.BACKUP_DIR_PATH, "/").concat(folder, "/").concat(item.id, ".json"), JSON.stringify(item));

                      resolve();
                    } catch (e) {
                      reject(e);
                    }
                  });
                });
              };

              _context.next = 31;
              return Promise.all(Object.assign([], writeData(scripts, 'scripts'), writeData(screens, 'screens'), writeData(diagnoses, 'diagnoses'), writeData(configKeys, 'configKeys'), writeData(hospitals, 'hospitals') // writeData(files, 'files')
              ));

            case 31:
              if (!lastBackUpDetails.last_backup_date) {
                _context.next = 51;
                break;
              }

              whereLastDeleted = {
                deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastBackUpDetails.last_backup_date)
              };
              _context.next = 35;
              return database.Script.findAll({
                where: whereLastDeleted
              });

            case 35:
              deletedScripts = _context.sent;
              _context.next = 38;
              return database.Screen.findAll({
                where: whereLastDeleted
              });

            case 38:
              deletedScreens = _context.sent;
              _context.next = 41;
              return database.Diagnosis.findAll({
                where: whereLastDeleted
              });

            case 41:
              deletedDiagnoses = _context.sent;
              _context.next = 44;
              return database.ConfigKey.findAll({
                where: whereLastDeleted
              });

            case 44:
              deletedConfigKeys = _context.sent;
              _context.next = 47;
              return database.Hospital.findAll({
                where: whereLastDeleted
              });

            case 47:
              deletedHospitals = _context.sent;

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

              _context.next = 51;
              return Promise.all(Object.assign([], deleteData(deletedScripts, 'scripts'), deleteData(deletedScreens, 'screens'), deleteData(deletedDiagnoses, 'diagnoses'), deleteData(deletedConfigKeys, 'configKeys'), deleteData(deletedHospitals, 'hospitals') // deleteData(deletedFiles, 'files')
              ));

            case 51:
              rslts = null;
              appInfo = _objectSpread(_objectSpread({}, appInfo), {}, {
                last_backup_date: new Date(),
                version: (appInfo.version || 0) + 1
              });

              if (!(appInfo.id !== 1)) {
                _context.next = 60;
                break;
              }

              _context.next = 56;
              return database.App.findOrCreate({
                where: {
                  id: 1
                },
                defaults: appInfo
              });

            case 56:
              rslts = _context.sent;
              appInfo = JSON.parse(JSON.stringify(rslts[0]));
              _context.next = 63;
              break;

            case 60:
              _context.next = 62;
              return database.App.update(appInfo, {
                where: {
                  id: 1
                }
              });

            case 62:
              rslts = _context.sent;

            case 63:
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

            case 65:
              resolve();
              _context.next = 71;
              break;

            case 68:
              _context.prev = 68;
              _context.t0 = _context["catch"](0);
              reject(_context.t0);

            case 71:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 68]]);
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
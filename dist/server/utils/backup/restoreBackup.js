"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = restoreBackup;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _fs = _interopRequireDefault(require("fs"));
var _database = require("../../database");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
function restoreBackup() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var lastBackUpDetails, readDir, scripts, screens, diagnoses, configKeys, saveData;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            if (_fs["default"].existsSync(process.env.BACKUP_DIR_PATH)) {
              _context3.next = 3;
              break;
            }
            return _context3.abrupt("return", reject(new Error('Backup directory not found')));
          case 3:
            _context3.next = 8;
            break;
          case 5:
            _context3.prev = 5;
            _context3.t0 = _context3["catch"](0);
            return _context3.abrupt("return", reject(_context3.t0));
          case 8:
            lastBackUpDetails = _fs["default"].existsSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) ? _fs["default"].readFileSync("".concat(process.env.BACKUP_DIR_PATH, "/app.json")) : JSON.stringify({});
            lastBackUpDetails = JSON.parse(lastBackUpDetails);
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
            _context3.next = 13;
            return readDir('scripts');
          case 13:
            scripts = _context3.sent;
            _context3.next = 16;
            return readDir('screens');
          case 16:
            screens = _context3.sent;
            _context3.next = 19;
            return readDir('diagnoses');
          case 19:
            diagnoses = _context3.sent;
            _context3.next = 22;
            return readDir('configKeys');
          case 22:
            configKeys = _context3.sent;
            _context3.next = 25;
            return Promise.all([_database.Script.destroy({
              where: {}
            }), _database.Screen.destroy({
              where: {}
            }), _database.Diagnosis.destroy({
              where: {}
            }), _database.ConfigKey.destroy({
              where: {}
            })]);
          case 25:
            saveData = function saveData(Model) {
              var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
              return new Promise(function (resolve, reject) {
                (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                  var rslts;
                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return Promise.all(data.map(function (item) {
                          return Model.create(_objectSpread(_objectSpread({}, item), {}, {
                            data: JSON.stringify(item.data)
                          }));
                        }));
                      case 3:
                        rslts = _context2.sent;
                        resolve(rslts);
                        _context2.next = 10;
                        break;
                      case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2["catch"](0);
                        reject(_context2.t0);
                      case 10:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2, null, [[0, 7]]);
                }))();
              });
            };
            _context3.next = 28;
            return saveData(_database.Script, scripts);
          case 28:
            _context3.next = 30;
            return saveData(_database.Screen, screens);
          case 30:
            _context3.next = 32;
            return saveData(_database.Diagnosis, diagnoses);
          case 32:
            _context3.next = 34;
            return saveData(_database.ConfigKey, configKeys);
          case 34:
            _context3.next = 36;
            return _database.App.update(_objectSpread(_objectSpread({}, lastBackUpDetails), {}, {
              last_backup_date: new Date()
            }), {
              where: {
                id: 1
              }
            });
          case 36:
            resolve();
          case 37:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[0, 5]]);
    }))();
  });
}
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(restoreBackup, "restoreBackup", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/utils/backup/restoreBackup.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
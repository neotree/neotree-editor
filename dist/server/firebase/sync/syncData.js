"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _index = require("../index");
var _models = require("../../database/models");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var _default = function _default() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var errors, scripts, countScripts, rslts, screens, countScreens, _rslts, diagnoses, countDiagnoses, _rslts2, hospitals, countHospitals, _rslts3, configKeys, countConfigKeys, _rslts4;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            errors = [];
            scripts = [];
            _context.prev = 2;
            _context.next = 5;
            return _models.Script.count({
              where: {}
            });
          case 5:
            countScripts = _context.sent;
            if (countScripts) {
              _context.next = 13;
              break;
            }
            console.log('Importing firebase scripts...');
            _context.next = 10;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('scripts').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 10:
            rslts = _context.sent;
            rslts = rslts || {};
            scripts = Object.keys(rslts).map(function (key) {
              return rslts[key];
            });
          case 13:
            _context.next = 18;
            break;
          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](2);
            errors.push(_context.t0);
          case 18:
            screens = [];
            _context.prev = 19;
            _context.next = 22;
            return _models.Screen.count({
              where: {}
            });
          case 22:
            countScreens = _context.sent;
            if (countScreens) {
              _context.next = 30;
              break;
            }
            console.log('Importing firebase screens...');
            _context.next = 27;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('screens').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 27:
            _rslts = _context.sent;
            _rslts = _rslts || {};
            screens = Object.keys(_rslts).reduce(function (acc, scriptId) {
              var _screens = _rslts[scriptId];
              return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(Object.keys(_screens).map(function (key) {
                return _screens[key];
              })));
            }, []);
          case 30:
            _context.next = 35;
            break;
          case 32:
            _context.prev = 32;
            _context.t1 = _context["catch"](19);
            errors.push(_context.t1);
          case 35:
            diagnoses = [];
            _context.prev = 36;
            _context.next = 39;
            return _models.Diagnosis.count({
              where: {}
            });
          case 39:
            countDiagnoses = _context.sent;
            if (countDiagnoses) {
              _context.next = 47;
              break;
            }
            console.log('Importing firebase diagnoses...');
            _context.next = 44;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('diagnosis').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 44:
            _rslts2 = _context.sent;
            _rslts2 = _rslts2 || {};
            diagnoses = Object.keys(_rslts2).reduce(function (acc, scriptId) {
              var _diagnoses = _rslts2[scriptId];
              return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(Object.keys(_diagnoses).map(function (key) {
                return _diagnoses[key];
              })));
            }, []);
          case 47:
            _context.next = 52;
            break;
          case 49:
            _context.prev = 49;
            _context.t2 = _context["catch"](36);
            errors.push(_context.t2);
          case 52:
            hospitals = [];
            _context.prev = 53;
            _context.next = 56;
            return _models.Hospital.count({
              where: {}
            });
          case 56:
            countHospitals = _context.sent;
            if (countHospitals) {
              _context.next = 64;
              break;
            }
            console.log('Importing firebase hospitals...');
            _context.next = 61;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('hospitals').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 61:
            _rslts3 = _context.sent;
            _rslts3 = _rslts3 || {};
            hospitals = Object.keys(_rslts3).map(function (key) {
              return _rslts3[key];
            });
          case 64:
            _context.next = 69;
            break;
          case 66:
            _context.prev = 66;
            _context.t3 = _context["catch"](53);
            errors.push(_context.t3);
          case 69:
            configKeys = [];
            _context.prev = 70;
            _context.next = 73;
            return _models.ConfigKey.count({
              where: {}
            });
          case 73:
            countConfigKeys = _context.sent;
            if (countConfigKeys) {
              _context.next = 81;
              break;
            }
            console.log('Importing firebase configKeys...');
            _context.next = 78;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('configkeys').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 78:
            _rslts4 = _context.sent;
            _rslts4 = _rslts4 || {};
            configKeys = Object.keys(_rslts4).map(function (key) {
              return _rslts4[key];
            });
          case 81:
            _context.next = 86;
            break;
          case 83:
            _context.prev = 83;
            _context.t4 = _context["catch"](70);
            errors.push(_context.t4);
          case 86:
            _context.prev = 86;
            _context.next = 89;
            return Promise.all([].concat((0, _toConsumableArray2["default"])(scripts.map(function (s) {
              return _models.Script.findOrCreate({
                where: {
                  script_id: s.scriptId
                },
                defaults: {
                  position: s.position,
                  script_id: s.scriptId,
                  data: JSON.stringify(s)
                }
              });
            })), (0, _toConsumableArray2["default"])(screens.map(function (s) {
              return _models.Screen.findOrCreate({
                where: {
                  script_id: s.scriptId,
                  screen_id: s.screenId
                },
                defaults: {
                  type: s.type,
                  position: s.position,
                  screen_id: s.screenId,
                  script_id: s.scriptId,
                  data: JSON.stringify(s)
                }
              });
            })), (0, _toConsumableArray2["default"])(diagnoses.map(function (s) {
              return _models.Diagnosis.findOrCreate({
                where: {
                  script_id: s.scriptId,
                  diagnosis_id: s.diagnosisId
                },
                defaults: {
                  position: s.position,
                  diagnosis_id: s.diagnosisId,
                  script_id: s.scriptId,
                  data: JSON.stringify(s)
                }
              });
            })), (0, _toConsumableArray2["default"])(configKeys.map(function (s) {
              return _models.ConfigKey.findOrCreate({
                where: {
                  config_key_id: s.configKeyId
                },
                defaults: {
                  position: s.position,
                  config_key_id: s.configKeyId,
                  data: JSON.stringify(s)
                }
              });
            })), (0, _toConsumableArray2["default"])(hospitals.map(function (s) {
              return _models.Hospital.findOrCreate({
                where: {
                  hospital_id: s.hospitalId
                },
                defaults: {
                  hospital_id: s.hospitalId,
                  name: s.name,
                  country: s.country
                }
              });
            }))));
          case 89:
            _context.next = 94;
            break;
          case 91:
            _context.prev = 91;
            _context.t5 = _context["catch"](86);
            errors.push(_context.t5);
          case 94:
            if (!errors.length) {
              _context.next = 96;
              break;
            }
            return _context.abrupt("return", reject(errors));
          case 96:
            resolve();
          case 97:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 15], [19, 32], [36, 49], [53, 66], [70, 83], [86, 91]]);
    }))();
  });
};
var _default2 = _default;
exports["default"] = _default2;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/firebase/sync/syncData.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
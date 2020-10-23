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
      var errors, countScripts, scripts, rslts, screens, _rslts, diagnoses, _rslts2, hospitals, _rslts3, configKeys, _rslts4;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              errors = [];
              countScripts = 0;
              _context.prev = 2;
              _context.next = 5;
              return _models.Script.count({
                where: {}
              });

            case 5:
              countScripts = _context.sent;
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);
              return _context.abrupt("return", reject(_context.t0));

            case 11:
              if (!countScripts) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return", resolve());

            case 13:
              scripts = [];
              _context.prev = 14;
              console.log('Importing firebase scripts...');
              _context.next = 18;
              return new Promise(function (resolve) {
                _index.firebaseAdmin.database().ref('scripts').once('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 18:
              rslts = _context.sent;
              rslts = rslts || {};
              scripts = Object.keys(rslts).map(function (key) {
                return rslts[key];
              });
              _context.next = 26;
              break;

            case 23:
              _context.prev = 23;
              _context.t1 = _context["catch"](14);
              errors.push(_context.t1);

            case 26:
              screens = [];
              _context.prev = 27;
              console.log('Importing firebase screens...');
              _context.next = 31;
              return new Promise(function (resolve) {
                _index.firebaseAdmin.database().ref('screens').once('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 31:
              _rslts = _context.sent;
              _rslts = _rslts || {};
              screens = Object.keys(_rslts).reduce(function (acc, scriptId) {
                var _screens = _rslts[scriptId];
                return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(Object.keys(_screens).map(function (key) {
                  return _screens[key];
                })));
              }, []);
              _context.next = 39;
              break;

            case 36:
              _context.prev = 36;
              _context.t2 = _context["catch"](27);
              errors.push(_context.t2);

            case 39:
              diagnoses = [];
              _context.prev = 40;
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
              _context.next = 52;
              break;

            case 49:
              _context.prev = 49;
              _context.t3 = _context["catch"](40);
              errors.push(_context.t3);

            case 52:
              hospitals = [];
              _context.prev = 53;
              console.log('Importing firebase hospitals...');
              _context.next = 57;
              return new Promise(function (resolve) {
                _index.firebaseAdmin.database().ref('hospitals').once('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 57:
              _rslts3 = _context.sent;
              _rslts3 = _rslts3 || {};
              hospitals = Object.keys(_rslts3).map(function (key) {
                return _rslts3[key];
              });
              _context.next = 65;
              break;

            case 62:
              _context.prev = 62;
              _context.t4 = _context["catch"](53);
              errors.push(_context.t4);

            case 65:
              configKeys = [];
              _context.prev = 66;
              console.log('Importing firebase configKeys...');
              _context.next = 70;
              return new Promise(function (resolve) {
                _index.firebaseAdmin.database().ref('configkeys').once('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 70:
              _rslts4 = _context.sent;
              _rslts4 = _rslts4 || {};
              configKeys = Object.keys(_rslts4).map(function (key) {
                return _rslts4[key];
              });
              _context.next = 78;
              break;

            case 75:
              _context.prev = 75;
              _context.t5 = _context["catch"](66);
              errors.push(_context.t5);

            case 78:
              _context.prev = 78;
              console.log('Saving imported data...');
              _context.next = 82;
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

            case 82:
              _context.next = 87;
              break;

            case 84:
              _context.prev = 84;
              _context.t6 = _context["catch"](78);
              errors.push(_context.t6);

            case 87:
              if (!errors.length) {
                _context.next = 89;
                break;
              }

              return _context.abrupt("return", reject(errors));

            case 89:
              resolve();

            case 90:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 8], [14, 23], [27, 36], [40, 49], [53, 62], [66, 75], [78, 84]]);
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

  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/firebase/sync/syncData.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyDiagnosis = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyDiagnosis = function copyDiagnosis(_ref) {
  var scriptId = _ref.scriptId,
      id = _ref.diagnosisId;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var diagnosisId, snap, diagnosis, diagnoses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (scriptId) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required script "id" is not provided.')));

            case 2:
              if (id) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required diagnosis "id" is not provided.')));

            case 4:
              diagnosisId = null;
              _context.prev = 5;
              _context.next = 8;
              return _firebase["default"].database().ref('diagnoses').push();

            case 8:
              snap = _context.sent;
              diagnosisId = snap.key;
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", reject(_context.t0));

            case 15:
              diagnosis = null;
              _context.prev = 16;
              _context.next = 19;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(scriptId, "/").concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 19:
              diagnosis = _context.sent;
              _context.next = 24;
              break;

            case 22:
              _context.prev = 22;
              _context.t1 = _context["catch"](16);

            case 24:
              if (diagnosis) {
                _context.next = 26;
                break;
              }

              return _context.abrupt("return", reject(new Error("Diagnosis with id \"".concat(id, "\" not found"))));

            case 26:
              diagnoses = {};
              _context.prev = 27;
              _context.next = 30;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 30:
              diagnoses = _context.sent;
              diagnoses = diagnoses || {};
              _context.next = 36;
              break;

            case 34:
              _context.prev = 34;
              _context.t2 = _context["catch"](27);

            case 36:
              diagnosis = _objectSpread(_objectSpread({}, diagnosis), {}, {
                diagnosisId: diagnosisId,
                id: diagnosisId,
                position: Object.keys(diagnoses).length + 1
              });
              _context.prev = 37;
              _context.next = 40;
              return _firebase["default"].database().ref("diagnosis/".concat(scriptId, "/").concat(diagnosisId)).set(_objectSpread(_objectSpread({}, diagnosis), {}, {
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }));

            case 40:
              _context.next = 45;
              break;

            case 42:
              _context.prev = 42;
              _context.t3 = _context["catch"](37);
              return _context.abrupt("return", reject(_context.t3));

            case 45:
              _context.prev = 45;
              _context.next = 48;
              return _models.Diagnosis.findOrCreate({
                where: {
                  diagnosis_id: diagnosis.diagnosisId
                },
                defaults: {
                  diagnosis_id: diagnosis.diagnosisId,
                  script_id: diagnosis.scriptId,
                  position: diagnosis.position,
                  data: JSON.stringify(diagnosis)
                }
              });

            case 48:
              _context.next = 52;
              break;

            case 50:
              _context.prev = 50;
              _context.t4 = _context["catch"](45);

            case 52:
              resolve(diagnosis);

            case 53:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 12], [16, 22], [27, 34], [37, 42], [45, 50]]);
    }))();
  });
};

exports.copyDiagnosis = copyDiagnosis;

var _default = function _default(app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var diagnoses, done, _diagnoses;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              diagnoses = req.body.diagnoses;

              done = function done(err) {
                var _diagnoses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                if (_diagnoses.length) {
                  app.io.emit('create_diagnoses', {
                    key: app.getRandomString(),
                    diagnoses: diagnoses
                  });

                  _models.Log.create({
                    name: 'create_diagnoses',
                    data: JSON.stringify({
                      diagnoses: diagnoses
                    })
                  });
                }

                res.locals.setResponse(err, {
                  diagnoses: _diagnoses
                });
                next();
              };

              _diagnoses = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(diagnoses.map(function (s) {
                return copyDiagnosis(s);
              }));

            case 6:
              _diagnoses = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, _diagnoses);

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

  reactHotLoader.register(copyDiagnosis, "copyDiagnosis", "/home/farai/WorkBench/neotree-editor/server/routes/diagnoses/duplicateDiagnosesMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/diagnoses/duplicateDiagnosesMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
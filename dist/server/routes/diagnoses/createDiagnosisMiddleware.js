"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDiagnosis = createDiagnosis;
exports.createDiagnosisMiddleware = createDiagnosisMiddleware;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _database = require("../../database");
var _excluded = ["scriptId"],
  _excluded2 = ["data"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
function createDiagnosis() {
  return _createDiagnosis.apply(this, arguments);
}
function _createDiagnosis() {
  _createDiagnosis = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var _payload,
      scriptId,
      payload,
      diagnosisId,
      snap,
      diagnosesCount,
      diagnosis,
      rslts,
      _JSON$parse,
      data,
      s,
      _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _payload = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
          scriptId = _payload.scriptId, payload = (0, _objectWithoutProperties2["default"])(_payload, _excluded);
          diagnosisId = null;
          _context2.prev = 3;
          _context2.next = 6;
          return _firebase["default"].database().ref("diagnosis/".concat(scriptId)).push();
        case 6:
          snap = _context2.sent;
          diagnosisId = snap.key;
          _context2.next = 13;
          break;
        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](3);
          throw _context2.t0;
        case 13:
          diagnosesCount = 0;
          _context2.prev = 14;
          _context2.next = 17;
          return _database.Diagnosis.count({
            where: {
              script_id: scriptId,
              deletedAt: null
            }
          });
        case 17:
          diagnosesCount = _context2.sent;
          _context2.next = 22;
          break;
        case 20:
          _context2.prev = 20;
          _context2.t1 = _context2["catch"](14);
        case 22:
          diagnosis = _objectSpread(_objectSpread({}, payload), {}, {
            diagnosisId: diagnosisId,
            diagnosis_id: diagnosisId,
            scriptId: scriptId,
            script_id: scriptId,
            position: diagnosesCount + 1,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
            updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });
          _context2.prev = 23;
          _context2.next = 26;
          return _database.Diagnosis.findOrCreate({
            where: {
              diagnosis_id: diagnosis.diagnosisId
            },
            defaults: {
              script_id: scriptId,
              diagnosis_id: diagnosis.diagnosisId,
              position: diagnosis.position,
              // type: diagnosis.type,
              data: JSON.stringify(diagnosis)
            }
          });
        case 26:
          rslts = _context2.sent;
          if (rslts && rslts[0]) {
            _JSON$parse = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded2);
            diagnosis = _objectSpread(_objectSpread({}, data), s);
          }
          _context2.next = 33;
          break;
        case 30:
          _context2.prev = 30;
          _context2.t2 = _context2["catch"](23);
          throw _context2.t2;
        case 33:
          return _context2.abrupt("return", diagnosis);
        case 34:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[3, 10], [14, 20], [23, 30]]);
  }));
  return _createDiagnosis.apply(this, arguments);
}
function createDiagnosisMiddleware() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, d;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            done = function done(err, diagnosis) {
              res.locals.setResponse(err, {
                diagnosis: diagnosis
              });
              next();
            };
            _context.prev = 1;
            _context.next = 4;
            return createDiagnosis(req.body);
          case 4:
            d = _context.sent;
            done(null, d);
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            done(_context.t0);
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8]]);
    }))();
  };
}
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(createDiagnosis, "createDiagnosis", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/diagnoses/createDiagnosisMiddleware.js");
  reactHotLoader.register(createDiagnosisMiddleware, "createDiagnosisMiddleware", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/diagnoses/createDiagnosisMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
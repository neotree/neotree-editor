"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateDiagnosis = exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _models = require("../../database/models");
var _excluded = ["id"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var updateDiagnosis = function updateDiagnosis(_ref) {
  var id = _ref.id,
    payload = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var diagnosis;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (id) {
              _context.next = 2;
              break;
            }
            return _context.abrupt("return", reject(new Error('Required diagnosis "id" is not provided.')));
          case 2:
            diagnosis = null;
            _context.prev = 3;
            _context.next = 6;
            return _models.Diagnosis.findOne({
              where: {
                id: id
              }
            });
          case 6:
            diagnosis = _context.sent;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", reject(_context.t0));
          case 12:
            if (diagnosis) {
              _context.next = 14;
              break;
            }
            return _context.abrupt("return", reject(new Error("Diagnosis with id \"".concat(id, "\" not found"))));
          case 14:
            _context.prev = 14;
            _context.next = 17;
            return _models.Diagnosis.update({
              position: payload.position || diagnosis.position,
              data: JSON.stringify(_objectSpread(_objectSpread({}, diagnosis.data), payload))
            }, {
              where: {
                id: id
              }
            });
          case 17:
            _context.next = 21;
            break;
          case 19:
            _context.prev = 19;
            _context.t1 = _context["catch"](14);
          case 21:
            resolve(diagnosis);
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9], [14, 19]]);
    }))();
  });
};
exports.updateDiagnosis = updateDiagnosis;
var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var done, diagnosis;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            done = function done(err, diagnosis) {
              res.locals.setResponse(err, {
                diagnosis: diagnosis
              });
              next();
            };
            diagnosis = null;
            _context2.prev = 2;
            _context2.next = 5;
            return updateDiagnosis(req.body);
          case 5:
            diagnosis = _context2.sent;
            _context2.next = 11;
            break;
          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", done(_context2.t0));
          case 11:
            done(null, diagnosis);
          case 12:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[2, 8]]);
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
  reactHotLoader.register(updateDiagnosis, "updateDiagnosis", "/home/farai/Workbench/neotree-editor/server/routes/diagnoses/updateDiagnosisMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/routes/diagnoses/updateDiagnosisMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _models = require("../../database/models");
var _excluded = ["id", "createdAt", "updatedAt", "data"],
  _excluded2 = ["data"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, items, scriptId, done, snaps, diagnosesCount, diagnoses, rslts;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _req$body = req.body, items = _req$body.items, scriptId = _req$body.targetScriptId;
            done = function done(err) {
              var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
              res.locals.setResponse(err, {
                items: items
              });
              next();
            };
            snaps = [];
            _context.prev = 3;
            _context.next = 6;
            return Promise.all(items.map(function () {
              return _firebase["default"].database().ref("diagnosis/".concat(scriptId)).push();
            }));
          case 6:
            snaps = _context.sent;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 12:
            diagnosesCount = 0;
            _context.prev = 13;
            _context.next = 16;
            return _models.Diagnosis.count({
              where: {
                script_id: scriptId,
                deletedAt: null
              }
            });
          case 16:
            diagnosesCount = _context.sent;
            _context.next = 21;
            break;
          case 19:
            _context.prev = 19;
            _context.t1 = _context["catch"](13);
          case 21:
            diagnoses = [];
            _context.prev = 22;
            _context.next = 25;
            return _models.Diagnosis.findAll({
              where: {
                id: items.map(function (s) {
                  return s.id;
                })
              }
            });
          case 25:
            diagnoses = _context.sent;
            diagnoses = diagnoses.map(function (dignosis, i) {
              var _JSON$parse = JSON.parse(JSON.stringify(dignosis)),
                id = _JSON$parse.id,
                createdAt = _JSON$parse.createdAt,
                updatedAt = _JSON$parse.updatedAt,
                data = _JSON$parse.data,
                d = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded); // eslint-disable-line
              return _objectSpread(_objectSpread({}, d), {}, {
                diagnosis_id: snaps[i].key,
                script_id: scriptId,
                position: diagnosesCount + 1,
                data: JSON.stringify(_objectSpread(_objectSpread({}, data), {}, {
                  scriptId: scriptId,
                  script_id: scriptId,
                  diagnosisId: snaps[i].key,
                  diagnosis_id: snaps[i].key,
                  position: diagnosesCount + 1,
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }))
              });
            });
            _context.next = 32;
            break;
          case 29:
            _context.prev = 29;
            _context.t2 = _context["catch"](22);
            return _context.abrupt("return", done(_context.t2));
          case 32:
            _context.prev = 32;
            _context.next = 35;
            return Promise.all(diagnoses.map(function (diagnosis) {
              return _models.Diagnosis.findOrCreate({
                where: {
                  diagnosis_id: diagnosis.diagnosis_id
                },
                defaults: _objectSpread({}, diagnosis)
              });
            }));
          case 35:
            rslts = _context.sent;
            diagnoses = rslts.map(function (rslt) {
              var _JSON$parse2 = JSON.parse(JSON.stringify(rslt[0])),
                data = _JSON$parse2.data,
                diagnosis = (0, _objectWithoutProperties2["default"])(_JSON$parse2, _excluded2);
              return _objectSpread(_objectSpread({}, data), diagnosis);
            });
            _context.next = 41;
            break;
          case 39:
            _context.prev = 39;
            _context.t3 = _context["catch"](32);
          case 41:
            done(null, diagnoses);
          case 42:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9], [13, 19], [22, 29], [32, 39]]);
    }))();
  };
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, done, position, saveToFirebase, diagnosis_id;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              payload = req.body;

              done = function done(err, diagnosis) {
                if (err) app.logger.log(err);
                if (diagnosis) app.io.emit('create_diagnoses', {
                  key: app.getRandomString(),
                  diagnoses: [{
                    id: diagnosis.id
                  }]
                });
                res.locals.setResponse(err, {
                  diagnosis: diagnosis
                });
                next();
                return null;
              };

              position = 0;
              _context.prev = 3;
              _context.next = 6;
              return _models.Diagnosis.count({
                where: {
                  script_id: payload.script_id
                }
              });

            case 6:
              position = _context.sent;
              position++;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 13:
              saveToFirebase = function saveToFirebase() {
                return new Promise(function (resolve, reject) {
                  _firebase["default"].database().ref("diagnosis/".concat(payload.script_id)).push().then(function (snap) {
                    var data = payload.data,
                        rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
                    var diagnosisId = snap.key;

                    var _data = data ? JSON.parse(data) : null;

                    _firebase["default"].database().ref("diagnosis/".concat(payload.script_id, "/").concat(diagnosisId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), _data), {}, {
                      position: position,
                      diagnosisId: diagnosisId,
                      scriptId: payload.script_id,
                      createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
                    })).then(function () {
                      resolve(diagnosisId);
                    })["catch"](reject);
                  })["catch"](reject);
                });
              };

              _context.prev = 14;
              _context.next = 17;
              return saveToFirebase();

            case 17:
              diagnosis_id = _context.sent;

              _models.Diagnosis.create(_objectSpread(_objectSpread({}, payload), {}, {
                position: position,
                diagnosis_id: diagnosis_id
              })).then(function (diagnosis) {
                return done(null, diagnosis);
              })["catch"](done);

              _context.next = 24;
              break;

            case 21:
              _context.prev = 21;
              _context.t1 = _context["catch"](14);
              done(_context.t1);

            case 24:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [14, 21]]);
    }))();
  };
};
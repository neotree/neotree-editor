"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyDiagnosis = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../database/firebase"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var copyDiagnosis = function copyDiagnosis(diagnosis) {
  return new Promise(function (resolve, reject) {
    _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id)).push().then(function (snap) {
      var data = diagnosis.data,
          rest = (0, _objectWithoutProperties2["default"])(diagnosis, ["data"]);
      var diagnosisId = snap.key;

      _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id, "/").concat(diagnosisId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), data), {}, {
        diagnosisId: diagnosisId,
        scriptId: diagnosis.script_id,
        createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
      })).then(function () {
        _database.Diagnosis.create(_objectSpread(_objectSpread({}, diagnosis), {}, {
          diagnosis_id: diagnosisId,
          data: JSON.stringify(diagnosis.data)
        })).then(function (diagnosis) {
          return resolve(diagnosis);
        })["catch"](function (err) {
          return reject(err);
        });
      })["catch"](reject);
    })["catch"](reject);
  });
};

exports.copyDiagnosis = copyDiagnosis;

var _default = function _default(app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, diagnosis) {
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

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });
    Promise.all([_database.Diagnosis.findOne({
      where: {
        id: id
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
          diagnosis = _ref2[0];

      if (!diagnosis) return done({
        msg: "Could not find diagnosis with \"id\" ".concat(id, ".")
      });
      diagnosis = diagnosis.toJSON();
      copyDiagnosis(diagnosis).then(function (diagnosis) {
        return done(null, diagnosis);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};

exports["default"] = _default;
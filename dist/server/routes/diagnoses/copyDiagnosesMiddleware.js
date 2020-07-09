"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, items) {
      if (err) app.logger.log(err);
      res.locals.setResponse(err, {
        items: items
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase(payload) {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref("diagnosis/".concat(payload.script_id)).push().then(function (snap) {
          var _payload$data = payload.data,
              position = _payload$data.position,
              data = (0, _objectWithoutProperties2["default"])(_payload$data, ["position"]),
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]); // eslint-disable-line

          var diagnosisId = snap.key;

          var diagnosis = _objectSpread(_objectSpread(_objectSpread({}, rest), data), {}, {
            diagnosisId: diagnosisId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });

          _firebase["default"].database().ref("diagnosis/".concat(payload.script_id, "/").concat(diagnosisId)).set(diagnosis).then(function () {
            resolve(_objectSpread(_objectSpread({}, rest), {}, {
              diagnosis_id: diagnosisId,
              data: JSON.stringify(diagnosis)
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    Promise.all([_models.Diagnosis.count({
      where: {
        script_id: payload.script_id
      }
    }), _models.Diagnosis.findAll({
      where: {
        id: payload.ids
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          count = _ref2[0],
          diagnoses = _ref2[1];

      Promise.all(diagnoses.map(function (diagnosis, i) {
        diagnosis = JSON.parse(JSON.stringify(diagnosis));
        var _diagnosis = diagnosis,
            createdAt = _diagnosis.createdAt,
            updateAt = _diagnosis.updateAt,
            id = _diagnosis.id,
            diagnosis_id = _diagnosis.diagnosis_id,
            d = (0, _objectWithoutProperties2["default"])(_diagnosis, ["createdAt", "updateAt", "id", "diagnosis_id"]); // eslint-disable-line

        return saveToFirebase(_objectSpread(_objectSpread({}, d), {}, {
          position: count + (i + 1),
          script_id: payload.script_id
        }));
      })).then(function (items) {
        return Promise.all(items.map(function (item) {
          return _models.Diagnosis.create(_objectSpread({}, item));
        })).then(function (items) {
          return done(null, items);
        })["catch"](done);
      })["catch"](done);
    })["catch"](done);
  };
};
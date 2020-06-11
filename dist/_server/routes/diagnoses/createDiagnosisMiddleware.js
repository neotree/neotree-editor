"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, diagnosis) {
      if (err) app.logger.log(err);
      if (diagnosis) app.io.emit('create_diagnoses', {
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

    var saveToFirebase = function saveToFirebase() {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref("diagnosis/".concat(payload.script_id)).push().then(function (snap) {
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var diagnosisId = snap.key;

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref("diagnosis/".concat(payload.script_id, "/").concat(diagnosisId)).set((0, _objectSpread2["default"])({}, rest, {}, _data, {
            diagnosisId: diagnosisId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          })).then(function () {
            resolve(diagnosisId);
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    Promise.all([_models.Diagnosis.count({
      where: {
        script_id: payload.script_id
      }
    }), saveToFirebase()]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          count = _ref2[0],
          diagnosis_id = _ref2[1];

      _models.Diagnosis.create((0, _objectSpread2["default"])({}, payload, {
        position: count + 1,
        diagnosis_id: diagnosis_id
      })).then(function (diagnosis) {
        return done(null, diagnosis);
      })["catch"](done);
    })["catch"](done);
  };
};
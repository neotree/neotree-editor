"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, diagnosis) {
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

    saveToFirebase().then(function (id) {
      _models.Diagnosis.create((0, _objectSpread2["default"])({}, payload, {
        id: id
      })).then(function (diagnosis) {
        return done(null, diagnosis);
      })["catch"](done);
    })["catch"](done);
  };
};
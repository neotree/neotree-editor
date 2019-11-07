"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var diagnosisId = snap.key;
          var diagnosis = (0, _objectSpread2["default"])({}, rest, {}, data, {
            diagnosisId: diagnosisId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });

          _firebase["default"].database().ref("diagnoses/".concat(payload.script_id, "/").concat(diagnosisId)).set(diagnosis).then(function () {
            resolve((0, _objectSpread2["default"])({}, rest, {
              id: diagnosisId,
              data: JSON.stringify(diagnosis)
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    _models.Diagnosis.findAll({
      where: {
        id: payload.ids
      }
    }).then(function (diagnoses) {
      Promise.all(diagnoses.map(function (diagnosis) {
        diagnosis = JSON.parse(JSON.stringify(diagnosis));
        var _diagnosis = diagnosis,
            createdAt = _diagnosis.createdAt,
            updateAt = _diagnosis.updateAt,
            id = _diagnosis.id,
            scr = (0, _objectWithoutProperties2["default"])(_diagnosis, ["createdAt", "updateAt", "id"]); // eslint-disable-line

        return saveToFirebase((0, _objectSpread2["default"])({}, scr, {
          script_id: payload.script_id
        }));
      })).then(function (items) {
        return Promise.all(items.map(function (item, i) {
          return _models.Diagnosis.create((0, _objectSpread2["default"])({}, item, {
            position: i + 1
          }));
        })).then(function (items) {
          return done(null, items);
        })["catch"](done);
      })["catch"](done);
    })["catch"](done);
  };
};
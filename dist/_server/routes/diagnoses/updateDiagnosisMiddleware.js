"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id"]);

    var done = function done(err, diagnosis) {
      if (diagnosis) {
        app.io.emit('update_diagnoses', {
          diagnoses: [{
            diagnosisId: diagnosis.diagnosis_id
          }]
        });

        _models.Log.create({
          name: 'update_diagnoses',
          data: JSON.stringify({
            diagnoses: [{
              diagnosisId: diagnosis.diagnosis_id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });

    _models.Diagnosis.update(payload, {
      where: {
        id: id
      },
      individualHooks: true
    }).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          _ref2$ = (0, _slicedToArray2["default"])(_ref2[1], 1),
          diagnosis = _ref2$[0];

      return done(null, diagnosis);
    })["catch"](done);
  };
};
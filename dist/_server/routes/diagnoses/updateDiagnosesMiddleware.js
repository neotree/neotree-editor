"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        diagnoses = _req$body.diagnoses,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    Promise.all(diagnoses.map(function (_ref) {
      var id = _ref.id,
          scr = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.Diagnosis.update((0, _objectSpread2["default"])({}, scr), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      if (!returnUpdated) return done(null, {
        rslts: rslts
      });

      _models.Diagnosis.findAll({
        where: {
          id: diagnoses.map(function (scr) {
            return scr.id;
          })
        }
      }).then(function (diagnoses) {
        return done(null, {
          diagnoses: diagnoses
        });
      })["catch"](done);

      return null;
    })["catch"](done);
  };
};
"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, diagnoses) {
      res.locals.setResponse(err, {
        diagnoses: diagnoses
      });
      next();
      return null;
    };

    _models.Diagnosis.findAll({
      where: payload,
      order: [['position', 'ASC']]
    }).then(function (diagnoses) {
      return done(null, diagnoses);
    })["catch"](done);
  };
};
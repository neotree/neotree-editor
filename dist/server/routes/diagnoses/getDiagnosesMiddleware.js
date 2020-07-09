"use strict";

var _models = require("../../models");

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
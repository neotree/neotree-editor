"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, diagnosis) {
      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    _models.Diagnosis.findOne({
      where: payload
    }).then(function (diagnosis) {
      return done(null, diagnosis);
    })["catch"](done);
  };
};
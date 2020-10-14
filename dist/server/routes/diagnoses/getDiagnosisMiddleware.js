"use strict";

var _database = require("../../database");

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

    _database.Diagnosis.findOne({
      where: payload
    }).then(function (diagnosis) {
      return done(null, diagnosis);
    })["catch"](done);
  };
};
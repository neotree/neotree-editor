"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, log) {
      res.locals.setResponse(err, {
        log: log
      });
      next();
      return null;
    };

    _models.Log.findOne({
      where: payload
    }).then(function (log) {
      return done(null, log);
    })["catch"](done);
  };
};
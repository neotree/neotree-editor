"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, logs) {
      res.locals.setResponse(err, {
        logs: logs
      });
      next();
      return null;
    };

    _models.Log.findAll({
      where: payload
    }).then(function (logs) {
      return done(null, logs);
    })["catch"](done);
  };
};
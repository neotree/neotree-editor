"use strict";

var _database = require("../../database");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, configKey) {
      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    _database.ConfigKey.findOne({
      where: payload
    }).then(function (configKey) {
      return done(null, configKey);
    })["catch"](done);
  };
};
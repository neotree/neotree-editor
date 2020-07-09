"use strict";

var _models = require("../../models");

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

    _models.ConfigKey.findOne({
      where: payload
    }).then(function (configKey) {
      return done(null, configKey);
    })["catch"](done);
  };
};
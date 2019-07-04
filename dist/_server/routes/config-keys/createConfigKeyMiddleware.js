"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, configKey) {
      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    _models.ConfigKey.create(payload).then(function (configKey) {
      return done(null, configKey);
    })["catch"](done);
  };
};
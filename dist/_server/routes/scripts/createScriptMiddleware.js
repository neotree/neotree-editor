"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app, params) {
  return function (req, res, next) {
    var payload = params || req.body;

    var done = function done(err, script) {
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    _models.Script.create(payload).then(function (script) {
      return done(null, script);
    })["catch"](done);
  };
};
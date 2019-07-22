"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || {});

    var done = function done(err, script) {
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    _models.Script.findOne({
      where: payload
    }).then(function (script) {
      return done(null, script);
    })["catch"](done);
  };
};
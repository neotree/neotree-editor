"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || '{}');

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
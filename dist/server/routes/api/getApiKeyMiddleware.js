"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    _models.ApiKey.findOne({
      where: {}
    }).then(function (apiKey) {
      return done(null, {
        apiKey: apiKey
      });
    })["catch"](done);
  };
};
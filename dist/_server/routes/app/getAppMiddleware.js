"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var done = function done(err) {
      var app = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      res.locals.setResponse(err, {
        app: app
      });
      next();
      return null;
      return null;
    };

    _models.App.findAll({}).then(function (apps) {
      return done(null, apps[0]);
    })["catch"](done);
  };
};
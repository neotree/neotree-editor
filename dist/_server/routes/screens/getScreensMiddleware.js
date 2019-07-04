"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || {});

    var done = function done(err, screens) {
      res.locals.setResponse(err, {
        screens: screens
      });
      next();
      return null;
    };

    _models.Screen.findAll({
      where: payload
    }).then(function (screens) {
      return done(null, screens);
    })["catch"](done);
  };
};
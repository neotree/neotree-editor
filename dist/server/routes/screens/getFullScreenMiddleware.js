"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, screen) {
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    _models.Screen.findOne({
      where: payload
    }).then(function (screen) {
      return done(null, screen);
    })["catch"](done);
  };
};
"use strict";

var _database = require("../../database");

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

    _database.Screen.findOne({
      where: payload
    }).then(function (screen) {
      return done(null, screen);
    })["catch"](done);
  };
};
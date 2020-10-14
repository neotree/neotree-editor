"use strict";

var _database = require("../../database");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, script) {
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    _database.Script.findOne({
      where: payload
    }).then(function (script) {
      return done(null, script);
    })["catch"](done);
  };
};
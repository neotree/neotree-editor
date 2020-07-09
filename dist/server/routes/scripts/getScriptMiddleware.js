"use strict";

var _models = require("../../models");

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

    _models.Script.findOne({
      where: payload
    }).then(function (script) {
      return done(null, script);
    })["catch"](done);
  };
};
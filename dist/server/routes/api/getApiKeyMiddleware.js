"use strict";

var _database = require("../../database");

module.exports = function () {
  return function (req, res, next) {
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    _database.ApiKey.findOne({
      where: {}
    }).then(function (apiKey) {
      return done(null, {
        apiKey: apiKey
      });
    })["catch"](done);
  };
};
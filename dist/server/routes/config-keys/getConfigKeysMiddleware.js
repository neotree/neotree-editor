"use strict";

var _database = require("../../database");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, configKeys) {
      res.locals.setResponse(err, {
        configKeys: configKeys
      });
      next();
      return null;
    };

    _database.ConfigKey.findAll({
      where: payload,
      order: [['position', 'ASC']]
    }).then(function (configKeys) {
      return done(null, configKeys);
    })["catch"](done);
  };
};
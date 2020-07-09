"use strict";

var _models = require("../../models");

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

    _models.ConfigKey.findAll({
      where: payload,
      order: [['position', 'ASC']]
    }).then(function (configKeys) {
      return done(null, configKeys);
    })["catch"](done);
  };
};
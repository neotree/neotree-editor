"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, scripts) {
      res.locals.setResponse(err, {
        scripts: scripts
      });
      next();
      return null;
    };

    _models.Script.findAll({
      where: payload,
      order: [['position', 'ASC']]
    }).then(function (scripts) {
      return done(null, scripts);
    })["catch"](done);
  };
};
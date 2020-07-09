"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    _models.Device.findOne({
      where: payload
    }).then(function (device) {
      return done(null, {
        device: device
      });
    })["catch"](done);
  };
};
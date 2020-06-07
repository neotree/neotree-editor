"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || '{}');

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
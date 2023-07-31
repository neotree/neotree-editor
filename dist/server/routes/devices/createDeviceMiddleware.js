"use strict";

var _database = require("../../database");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var payload = req.body;
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };
    _database.Device.create(payload).then(function (device) {
      return done(null, {
        device: device
      });
    })["catch"](done);
  };
};
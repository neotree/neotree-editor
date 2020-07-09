"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/register-device', require('./createDeviceMiddleware')(app), responseMiddleware);
  router.get('/get-device', require('./getDeviceMiddleware')(app), responseMiddleware);
  router.get('/get-devices', require('./getDevicesMiddleware')(app), responseMiddleware);
  return router;
};
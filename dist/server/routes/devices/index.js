"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/register-device', require('./createDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-device', require('./getDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-devices', require('./getDevicesMiddleware')(app), require('../../utils/responseMiddleware'));
  return router;
};
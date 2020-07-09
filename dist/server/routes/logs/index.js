"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/get-logs', require('./getLogsMiddleware')(app), responseMiddleware);
  router.get('/get-log', require('./getLogMiddleware')(app), responseMiddleware);
  return router;
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  return router.use(require('./auth')(app)).use(require('./data')(app)).use('/api', require('./api')(app)).use(require('./files')(app)).use(require('./users')(app)).use(require('./scripts')(app)).use(require('./screens')(app)).use(require('./diagnoses')(app)).use(require('./config-keys')(app)).use(require('./devices')(app));
};
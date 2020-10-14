"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/configKeys"));

var router = _express["default"].Router();

module.exports = function (app) {
  router.get(endpoints.GET_CONFIG_KEYS, require('./getConfigKeysMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_CONFIG_KEY, require('./getConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_FULL_CONFIG_KEY, require('./getFullConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.CREATE_CONFIG_KEY, require('./createConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_CONFIG_KEY, require('./updateConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_CONFIG_KEYS, require('./updateConfigKeysMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_CONFIG_KEY, require('./deleteConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.DUPLICATE_CONFIG_KEY, require('./duplicateConfigKeyMiddleware')["default"](app), require('../../utils/responseMiddleware'));
  return router;
};
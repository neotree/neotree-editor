"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/screens"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get(endpoints.GET_SCREENS, require('./getScreensMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_SCREEN, require('./getScreenMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.CREATE_SCREEN, require('./createScreenMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_SCREEN, require('./updateScreenMiddleware')["default"](app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_SCREENS, require('./updateScreensMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_SCREENS, require('./deleteScreensMiddleware')["default"](app), require('../../utils/responseMiddleware'));
  router.post(endpoints.DUPLICATE_SCREENS, require('./duplicateScreensMiddleware')["default"](app), require('../../utils/responseMiddleware'));
  router.post(endpoints.COPY_SCREENS, require('./copyScreensMiddleware')(app), require('../../utils/responseMiddleware'));
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/screens/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
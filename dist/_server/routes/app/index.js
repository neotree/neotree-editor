"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _express = _interopRequireDefault(require("express"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router = require('./importDataMiddleware')(router, app);
  router.get('/initialise-app', require('./initialiseAppMiddleware')(app), function (req, res) {
    var _ref = res.locals.getResponsePayload() || {},
        app = _ref.app,
        payload = (0, _objectWithoutProperties2["default"])(_ref, ["app"]);

    res.json({
      error: res.locals.getResponseError(),
      payload: (0, _objectSpread2["default"])({}, payload, {}, app)
    });
  });
  router.get('/export-data', require('./exportDataMiddleware')(app));
  router.post('/copy-data', require('./copyDataMiddleware')(app), responseMiddleware);
  router.get('/sync-firebase', require('./syncFirebaseMiddleware')(app));
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/bws/WorkBench/neotree-editor/_server/routes/app/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
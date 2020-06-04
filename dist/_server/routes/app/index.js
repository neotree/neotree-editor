"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _express = _interopRequireDefault(require("express"));

var _import = _interopRequireDefault(require("../../firebase/import"));

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
  router.post('/import-firebase', function (req, res, next) {
    var done = function done(err, data) {
      res.locals.setResponse(err, data);
      next();
    };

    (0, _import["default"])().then(function () {
      return done(null, {
        success: true
      });
    })["catch"](done);
  }, responseMiddleware);
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
  router.get('/get-data-activity-info', require('./getDataActivityInfo')(app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/app/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
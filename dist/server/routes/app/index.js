"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _import = _interopRequireDefault(require("../../firebase/import"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
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
  router.get('/initialise-app', require('../auth/getAuthenticatedUserMiddleware')(app), responseMiddleware);
  router.get('/export-data', require('./exportDataMiddleware')(app));
  router.post('/copy-data', require('./copyDataMiddleware')(app), responseMiddleware);
  router.post('/export-to-firebase', require('./exportToFirebaseMiddleware')(app), responseMiddleware);
  router.get('/sync-data', require('./syncData')(app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/app/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
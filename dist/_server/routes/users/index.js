"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _check = require("express-validator/check");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router(); //eslint-disable-line


module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.post('/sign-in', require('./signInMiddleware')(app), responseMiddleware);
  router.post('/sign-up', (0, _check.check)('password', 'empty-password').not().isEmpty(), (0, _check.check)('username', 'empty-username').not().isEmpty(), (0, _check.check)('username', 'Username must be a valid email.').isEmail(), (0, _check.check)('password', 'Password must have a minimum of 6 characters.').isLength({
    min: 6
  }), require('./signUpMiddleware')(app), responseMiddleware);
  router.get('/get-authenticated-user', require('./getAuthenticatedUserMiddleware')(app), responseMiddleware);
  /******************************************************************************
  *****************************LOGOUT********************************************/

  router.get('/logout', function (req, res) {
    req.logout();
    req.session.user = null;
    res.json({
      payload: {
        authenticatedUser: null
      }
    });
  });
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/bws/WorkBench/neotree-editor/_server/routes/users/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
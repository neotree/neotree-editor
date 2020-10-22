"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _check = require("express-validator/check");

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/auth"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get(endpoints.GET_AUTHENTICATED_USER, require('./getAuthenticatedUserMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.CHECK_EMAIL_REGISTRATION, require('./checkEmailRegistrationMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.SIGN_IN, require('./signInMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.SIGN_UP, (0, _check.check)('password', 'empty-password').not().isEmpty(), (0, _check.check)('username', 'empty-username').not().isEmpty(), (0, _check.check)('username', 'Email is not valid.').isEmail(), (0, _check.check)('password', 'Password must have a minimum of 6 characters.').isLength({
    min: 6
  }), function (req, res, next) {
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      res.locals.setResponse(errors.array());
      next();
    } else {
      require('./signUpMiddleware')(app)(req, res, next);
    }
  }, require('../../utils/responseMiddleware'));
  /******************************************************************************
  *****************************LOGOUT********************************************/

  router.get(endpoints.SIGN_OUT, function (req, res) {
    req.logout();
    req.session.user = null;
    res.json({
      authenticatedUser: null
    });
  });
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/auth/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
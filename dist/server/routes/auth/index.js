"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _express = _interopRequireDefault(require("express"));
var _check = require("express-validator/check");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var router = _express["default"].Router();
module.exports = function (app) {
  router.get('/get-authenticated-user', require('./getAuthenticatedUserMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/check-email-registration', require('./checkEmailRegistrationMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post('/sign-in', require('./signInMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post('/sign-up', (0, _check.check)('password', 'empty-password').not().isEmpty(), (0, _check.check)('username', 'empty-username').not().isEmpty(), (0, _check.check)('username', 'Email is not valid.').isEmail(), (0, _check.check)('password', 'Password must have a minimum of 6 characters.').isLength({
    min: 6
  }), require('./signUpMiddleware')(app), require('../../utils/responseMiddleware'));

  /******************************************************************************
  *****************************LOGOUT********************************************/
  router.get('/logout', function (req, res) {
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
  reactHotLoader.register(router, "router", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/auth/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
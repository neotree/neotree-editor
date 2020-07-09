"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _check = require("express-validator/check");

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/get-authenticated-user', require('./getAuthenticatedUserMiddleware')(app), app.responseMiddleware);
  router.get('/check-email-registration', require('./checkEmailRegistrationMiddleware')(app), app.responseMiddleware);
  router.post('/sign-in', require('./signInMiddleware')(app), app.responseMiddleware);
  router.post('/sign-up', (0, _check.check)('password', 'empty-password').not().isEmpty(), (0, _check.check)('username', 'empty-username').not().isEmpty(), (0, _check.check)('username', 'Email is not valid.').isEmail(), (0, _check.check)('password', 'Password must have a minimum of 6 characters.').isLength({
    min: 6
  }), require('./signUpMiddleware')(app), app.responseMiddleware);
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
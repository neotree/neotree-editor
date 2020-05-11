"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _check = require("express-validator/check");

var _addUser = _interopRequireDefault(require("./addUser"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    //eslint-disable-line
    var _ref = res.locals.signUpPayload || req.body,
        loginOnSignUp = _ref.loginOnSignUp,
        password2 = _ref.password2,
        params = (0, _objectWithoutProperties2["default"])(_ref, ["loginOnSignUp", "password2"]);

    var done = function done(err, user) {
      res.locals.setResponse(err, {
        user: user
      });
      next();
      return null;
    };

    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) done(errors.array());
    (0, _addUser["default"])(params).then(function (_ref2) {
      var user = _ref2.user,
          profile = _ref2.profile;
      if (!user) return done({
        msg: 'Something went wrong'
      });
      if (loginOnSignUp === false) return done(null, user);
      req.logIn(user, function (err) {
        if (err) done(err);
        done(null, profile || user);
      });
    })["catch"](done);
  };
};
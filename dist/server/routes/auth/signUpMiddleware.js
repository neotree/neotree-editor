"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _check = require("express-validator/check");

var _addOrUpdateUser = _interopRequireDefault(require("../users/addOrUpdateUser"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app, payload, callback) {
  return function (req, res, next) {
    var _ref = _objectSpread({}, payload || req.body),
        loginOnSignUp = _ref.loginOnSignUp,
        password2 = _ref.password2,
        params = (0, _objectWithoutProperties2["default"])(_ref, ["loginOnSignUp", "password2"]);

    var done = callback || function (err, rslts) {
      res.locals.setResponse(err, rslts);
      next();
      return null;
    };

    var errors = (0, _check.validationResult)(req);
    if (!errors.isEmpty()) done(errors.array());
    (0, _addOrUpdateUser["default"])(params).then(function (_ref2) {
      var user = _ref2.user,
          profile = _ref2.profile;
      if (!user) return done({
        msg: 'Something went wrong'
      });
      if (loginOnSignUp === false) return done(null, user);
      req.logIn(user, function (err) {
        if (err) done(err);
        done(null, {
          user: profile || user
        });
      });
    })["catch"](done);
  };
};
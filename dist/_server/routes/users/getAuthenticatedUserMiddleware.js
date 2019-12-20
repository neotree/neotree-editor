"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    // eslint-disable-line
    var done = function done(err, user) {
      res.locals.setResponse(err, {
        authenticatedUser: user
      });
      next();
      return null;
    };

    if (req.isAuthenticated()) {
      return Promise.all([_models.User.findOne({
        where: {
          id: req.user.id
        }
      }), _models.UserProfile.findOne({
        where: {
          user_id: req.user.id
        }
      })]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
            user = _ref2[0],
            profile = _ref2[1];

        return done(null, !profile ? null : (0, _objectSpread2["default"])({
          role: user ? user.role : 0
        }, JSON.parse(JSON.stringify(profile))));
      })["catch"](done);
    }

    done(null, null);
  };
};
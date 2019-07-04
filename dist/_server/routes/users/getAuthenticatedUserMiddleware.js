"use strict";

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
      return _models.UserProfile.findOne({
        where: {
          user_id: req.user.id
        }
      }).then(function (user) {
        return done(null, user);
      })["catch"](done);
    }

    done(null, null);
  };
};
"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var user = req.user ? req.user.id : null;

    var done = function done(err, ui) {
      res.locals.setResponse(err, {
        ui: ui
      });
      next();
      return null;
    };

    _models.UserInterface.findOne({
      where: {
        user: user
      }
    }).then(function (ui) {
      if (!ui) {
        res.locals.createUIParams = {
          user: user,
          options: {}
        };

        require('./createMyUIMiddleware')(app)(req, res, done);

        return null;
      }

      return done(null, ui);
    })["catch"](done);
  };
};
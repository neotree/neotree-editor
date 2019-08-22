"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = res.locals.updateUIParams || req.body;
    var user = req.user ? req.user.id : null;

    var done = function done(err, ui) {
      res.locals.setResponse(err, {
        ui: ui
      });
      next();
      return null;
    };

    if (!user) return done({
      msg: 'Required user "id" is not provided.'
    });

    _models.UserInterface.findOne({
      where: {
        user: user
      }
    }).then(function (s) {
      if (!s) {
        res.locals.createUIParams = (0, _objectSpread2["default"])({}, payload, {
          user: user
        });

        require('./createMyUIMiddleware')(app)(req, res, done);

        return null;
      }

      s.update(payload).then(function (ui) {
        return done(null, ui);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};
"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
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
      if (!s) return done({
        msg: "Could not find script with \"user\" ".concat(user, ".")
      });
      s.destroy({
        where: {
          user: user
        }
      }).then(function (deleted) {
        return done(null, {
          deleted: deleted
        });
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};
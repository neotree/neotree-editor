"use strict";

var _database = require("../../database");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (app, payload, callback) {
  return function (req, res, next) {
    var done = callback || function (err, payload) {
      res.locals.setResponse(err, err ? null : payload);
      next();
    };
    if (req.isAuthenticated()) {
      return _database.User.findOne({
        where: {
          email: req.user.email
        }
      }).then(function (u) {
        delete u.password;
        done(null, !u ? null : {
          authenticatedUser: u
        });
      })["catch"](done);
    }
    done(null, {
      authenticatedUser: null
    });
  };
};
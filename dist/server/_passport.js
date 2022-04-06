"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _passport = _interopRequireDefault(require("passport"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _database = require("./database");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var LocalStrategy = require('passport-local').Strategy;

module.exports = function (app) {
  _passport["default"].serializeUser(function (user, done) {
    // app.logger.log('passport.serializeUser');
    done(null, {
      email: user.email,
      id: user.id
    });
    return null;
  });

  _passport["default"].deserializeUser(function (user, done) {
    // app.logger.log('passport.deserializeUser');
    _database.User.findOne({
      where: {
        email: user.email
      },
      attributes: ['email', 'id']
    }).then(function (user) {
      done(null, user);
      return null;
    })["catch"](done);
  });
  /******************************************************************************
  *****************************LOCAL STRATEGY************************************/


  _passport["default"].use(new LocalStrategy(function (username, password, done) {
    // app.logger.log('new passport.LocalStrategy()');
    _database.User.findOne({
      where: {
        email: username
      }
    }).then(function (user) {
      if (!user) {
        return done(null, false, {
          type: 'NOT_FOUND',
          msg: 'Incorrect username or password'
        });
      }

      if (!user.password) {
        return done(null, false, {
          type: 'INCORRECT_PASSWORD',
          msg: 'Incorrect username or password'
        });
      } //Match password


      _bcryptjs["default"].compare(password, user.password, function (err, isMatch) {
        if (err) return done(err);

        if (isMatch) {
          return done(null, user);
        }

        return done(null, false, {
          type: 'INCORRECT_PASSWORD',
          msg: 'Incorrect username or password'
        });
      });
    })["catch"](function (err) {
      return done(err);
    });
  })); //passport


  app.use(_passport["default"].initialize());
  app.use(_passport["default"].session());
  app.passport = _passport["default"];
  return app;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(LocalStrategy, "LocalStrategy", "/home/farai/Workbench/neotree-editor/server/_passport.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
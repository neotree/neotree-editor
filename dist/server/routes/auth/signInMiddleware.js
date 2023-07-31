"use strict";

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (app) {
  return function (req, res, next) {
    app.passport.authenticate('local', function (error, user, info) {
      if (error) {
        res.locals.setResponse(error);
        next();
        return null;
      }
      if (!user) {
        res.locals.setResponse(info);
        next();
        return null;
      }
      req.logIn(user, function (err) {
        if (err) {
          res.locals.setResponse(err);
          next();
          return null;
        }
        res.locals.setResponse(null, {
          user: user
        });
        next();
        return null;
      });
    })(req, res, next);
  };
};
"use strict";

var _auth = require("../../constants/error-codes/auth");

module.exports = function (protectedMiddleware) {
  return function (req, res, next) {
    if (req.isAuthenticated()) return protectedMiddleware(req, res, next);
    res.locals.setResponse(new Error(_auth.UNAUTHORIZED));
    next();
  };
};
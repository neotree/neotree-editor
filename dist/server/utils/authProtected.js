"use strict";

var _auth = require("../../constants/error-codes/auth");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (protectedMiddleware) {
  return function (req, res, next) {
    if (req.isAuthenticated()) return protectedMiddleware(req, res, next);
    res.locals.setResponse(new Error(_auth.UNAUTHORIZED));
    next();
  };
};
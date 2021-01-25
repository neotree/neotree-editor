"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _models = require("../../models");

var _responseMiddleware = _interopRequireDefault(require("./responseMiddleware"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var key = req.headers['x-api-key'];

    var done = function done(e, apiKey) {
      if (e || !apiKey) {
        e = e || {
          msg: 'Invalid api key'
        };
        res.locals.setResponse(e);
        return (0, _responseMiddleware["default"])(req, res, next);
      }

      res.locals.setResponse(null, {
        apiKey: apiKey
      });
      next();
    };

    if (!key) return done({
      msg: 'Api key not provided'
    });

    _models.ApiKey.findOne({
      where: {
        key: key
      }
    }).then(function (apiKey) {
      return done(null, apiKey);
    })["catch"](done);
  };
};
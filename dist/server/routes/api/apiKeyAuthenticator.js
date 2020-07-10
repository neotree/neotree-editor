"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var key = req.headers['x-api-key'];

    var done = function done(e, apiKey) {
      res.locals.setResponse(e, !apiKey ? null : {
        apiKey: apiKey
      });

      if (e || !apiKey) {
        e = e || {
          msg: 'Invalid api key'
        };
        return app.responseMiddleware(req, res, next);
      }

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
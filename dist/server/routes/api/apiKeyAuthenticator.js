"use strict";

var _database = require("../../database");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var key = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;

    var done = function done(e, apiKey) {
      res.locals.setResponse(e, !apiKey ? null : {
        apiKey: apiKey
      });

      if (e || !apiKey) {
        e = e || {
          msg: 'Invalid api key'
        };
        return require('../../utils/responseMiddleware')(req, res, next);
      }

      next();
    };

    if (!key) return done({
      msg: 'Api key not provided'
    });

    _database.ApiKey.findOne({
      where: {
        key: key
      }
    }).then(function (apiKey) {
      return done(null, apiKey);
    })["catch"](done);
  };
};
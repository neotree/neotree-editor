"use strict";

var _database = require("../../database");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (app) {
  return function (req, res, next) {
    var apiKey = req.body.apiKey;
    var key = app.getRandomString();
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };
    (apiKey ? _database.ApiKey.update({
      key: key
    }, {
      where: {
        id: apiKey.id
      },
      individualHooks: true
    }) : _database.ApiKey.create({
      key: key
    })).then(function (apiKey) {
      return done(null, {
        apiKey: apiKey
      });
    })["catch"](done);
  };
};
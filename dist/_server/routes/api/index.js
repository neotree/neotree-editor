"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/key', function (req, res, next) {
    _models.ApiKey.findOne({
      where: {}
    }).then(function (apiKey) {
      res.locals.setResponse(null, {
        apiKey: apiKey
      });
      next();
    })["catch"](function (e) {
      res.locals.setResponse(e);
      next();
    });
  }, responseMiddleware);
  router.post('/generate-key', function (req, res, next) {
    var apiKey = req.body.apiKey;

    var getRandString = function getRandString() {
      return Math.random().toString(36).substring(2).toUpperCase();
    };

    var key = "".concat(getRandString()).concat(getRandString()).concat(getRandString());
    (apiKey ? _models.ApiKey.update({
      key: key
    }, {
      where: {
        id: apiKey.id
      },
      individualHooks: true
    }) : _models.ApiKey.create({
      key: key
    })).then(function (apiKey) {
      res.locals.setResponse(null, {
        apiKey: apiKey
      });
      next();
    })["catch"](function (e) {
      res.locals.setResponse(e);
      next();
    });
  }, responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/api/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
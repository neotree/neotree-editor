"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/get-scripts', require('./getScriptsMiddleware')(app), responseMiddleware);
  router.get('/get-script', require('./getScriptMiddleware')(app), responseMiddleware);
  router.get('/get-full-script', require('./getFullScriptMiddleware')(app), responseMiddleware);
  router.get('/get-script-items', require('./getScriptItemsMiddleware')(app), responseMiddleware);
  router.post('/create-script', require('./createScriptMiddleware')(app), responseMiddleware);
  router.post('/update-script', require('./updateScriptMiddleware')(app), responseMiddleware);
  router.post('/update-scripts', require('./updateScriptsMiddleware')(app), responseMiddleware);
  router.post('/delete-script', require('./deleteScriptMiddleware')(app), responseMiddleware);
  router.post('/duplicate-script', require('./duplicateScriptMiddleware')["default"](app), responseMiddleware);
  return router;
};
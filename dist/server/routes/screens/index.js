"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.post('/copy-screens', require('./copyScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screens', require('./getScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screen', require('./getScreenMiddleware')(app), responseMiddleware);
  router.get('/get-full-screen', require('./getFullScreenMiddleware')(app), responseMiddleware);
  router.post('/create-screen', require('./createScreenMiddleware')(app), responseMiddleware);
  router.post('/update-screen', require('./updateScreenMiddleware')(app), responseMiddleware);
  router.post('/update-screens', require('./updateScreensMiddleware')["default"](app), responseMiddleware);
  router.post('/delete-screen', require('./deleteScreenMiddleware')(app), responseMiddleware);
  router.post('/duplicate-screen', require('./duplicateScreenMiddleware')["default"](app), responseMiddleware);
  return router;
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _path = _interopRequireDefault(require("path"));

var _express = _interopRequireDefault(require("express"));

var _middlewares = _interopRequireDefault(require("./middlewares"));

var _models = require("./models");

var _server = _interopRequireDefault(require("../_config/server"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

Promise.all([(0, _models.dbInit)()])["catch"](function (e) {
  console.log('DATABASE INIT ERROR:', e); // eslint-disable-line

  process.exit(1);
}).then(function () {
  var app = (0, _express["default"])();
  app.sequelize = _models.sequelize;
  app.logger = require('../_utils/logger');

  var httpServer = require('http').Server(app);

  app.io = require('socket.io')(httpServer);
  app = (0, _middlewares["default"])(app);
  app.use('/assets', _express["default"]["static"](_path["default"].resolve(__dirname, '../src/assets'), {
    index: false
  }));
  app.use(_express["default"]["static"](_path["default"].resolve(__dirname, '../src'), {
    index: false
  }));
  app.get('*', require('./routes/app/initialiseAppMiddleware')(app), require('./middlewares/sendHTML')(app));
  app.server = httpServer.listen(_server["default"].port, function (err) {
    if (err) throw err;
    console.log("Server started on port ".concat(_server["default"].port)); // eslint-disable-line
  });
});
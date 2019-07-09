"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _multer = _interopRequireDefault(require("multer"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../../models");

var _handleScripts = _interopRequireDefault(require("./handleScripts"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var storage = _multer["default"].memoryStorage();

var upload = (0, _multer["default"])({
  storage: storage
});

module.exports = function (router, app) {
  var responseMiddleware = app.responseMiddleware;
  router.post('/import-data', upload.single('file'), function (req, res, next) {
    var done = function done(err) {
      res.locals.setResponse(err, err ? {} : {
        data_import_info: {
          date: new Date(),
          imported_by: (req.user || {}).id || null
        }
      });
      next();
      return null;
    };

    var data = JSON.parse(req.file.buffer);
    data.configKeys = data.configKeys || {};
    data.scripts = data.scripts || {};

    if (data.configKeys.map) {
      data.configKeys = data.configKeys.reduce(function (acc, current) {
        acc[current.id] = current;
        return acc;
      }, {});
    }

    if (data.scripts.map) {
      data.scripts = data.scripts.reduce(function (acc, current) {
        acc[current.id] = current;
        return acc;
      }, {});
    }

    var author = req.user ? req.user.id : null;
    var configKeys = Object.keys(data.configkeys || {}).map(function (key) {
      var _data$configkeys$key = data.configkeys[key],
          createdAt = _data$configkeys$key.createdAt,
          updatedAt = _data$configkeys$key.updatedAt,
          configKeyId = _data$configkeys$key.configKeyId,
          configKey = (0, _objectWithoutProperties2["default"])(_data$configkeys$key, ["createdAt", "updatedAt", "configKeyId"]); // eslint-disable-line

      return configKey;
    });
    var scripts = Object.keys(data.scripts || {}).map(function (key) {
      var _data$scripts$key = data.scripts[key],
          createdAt = _data$scripts$key.createdAt,
          updatedAt = _data$scripts$key.updatedAt,
          scriptId = _data$scripts$key.scriptId,
          script = (0, _objectWithoutProperties2["default"])(_data$scripts$key, ["createdAt", "updatedAt", "scriptId"]); // eslint-disable-line

      var screens = script.screens || data.screens[key] || {};
      var diagnoses = script.diagnoses || data.diagnosis[key] || {};
      return (0, _objectSpread2["default"])({}, script, {
        screens: script.screens || Object.keys(screens || {}).map(function (key) {
          return screens[key];
        }),
        diagnoses: script.diagnoses || Object.keys(diagnoses || {}).map(function (key) {
          return diagnoses[key];
        })
      });
    });
    configKeys.forEach(function (configKey) {
      _models.ConfigKey.create({
        id: (0, _uuidv["default"])(),
        author: author,
        data: JSON.stringify(configKey.data || configKey)
      }).then(function () {
        return null;
      })["catch"](function (err) {
        return console.log(configKey, err);
      });
    });
    (0, _handleScripts["default"])(app, {
      scripts: scripts,
      author: author
    }, done);
    if (configKeys.length === 0 && scripts.length === 0) done();
  }, responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(storage, "storage", "/home/bws/WorkBench/neotree-editor/_server/routes/app/importDataMiddleware/index.js");
  reactHotLoader.register(upload, "upload", "/home/bws/WorkBench/neotree-editor/_server/routes/app/importDataMiddleware/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
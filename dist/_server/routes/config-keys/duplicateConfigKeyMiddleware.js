"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyConfigKey = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyConfigKey = function copyConfigKey(req, configKey) {
  return new Promise(function (resolve, reject) {
    _models.ConfigKey.create((0, _objectSpread2["default"])({}, configKey, {
      id: (0, _uuidv["default"])(),
      data: JSON.stringify(configKey.data)
    })).then(function (configKey) {
      return resolve(configKey);
    })["catch"](function (err) {
      return reject(err);
    });
  });
};

exports.copyConfigKey = copyConfigKey;

var _default = function _default() {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, configKey) {
      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required configKey "id" is not provided.'
    });
    Promise.all([_models.ConfigKey.findOne({
      where: {
        id: id
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
          configKey = _ref2[0];

      if (!configKey) return done({
        msg: "Could not find configKey with \"id\" ".concat(id, ".")
      });
      configKey = configKey.toJSON();
      copyConfigKey(req, configKey).then(function (configKey) {
        return done(null, configKey);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyConfigKey, "copyConfigKey", "/home/bws/WorkBench/neotree-editor/_server/routes/config-keys/duplicateConfigKeyMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/routes/config-keys/duplicateConfigKeyMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
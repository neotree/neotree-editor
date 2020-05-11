"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var firebaseConfig = function () {
  try {
    return require(process.env.NEOTREE_FIREBASE_CONFIG_FILE);
  } catch (e) {
    return require('./firebase.config.json');
  }
}();

try {
  module.exports = (0, _objectSpread2["default"])({
    firebaseConfig: firebaseConfig
  }, require(process.env.NEOTREE_CONFIG_FILE));
} catch (e) {
  module.exports = (0, _objectSpread2["default"])({
    firebaseConfig: firebaseConfig
  }, require('./server.config'));
}

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(firebaseConfig, "firebaseConfig", "/home/lamyfarai/Workbench/neotree-editor/_config/server.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
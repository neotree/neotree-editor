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

var serverType = process.env.NEOTREE_SERVER_TYPE;
var firebaseConfigFileName = process.env.NEOTREE_FIREBASE_CONFIG_FILE;
var serverConfigFileName = process.env.NEOTREE_CONFIG_FILE;

if (serverType === 'production') {
  firebaseConfigFileName = process.env.NEOTREE_PRODUCTION_FIREBASE_CONFIG_FILE;
  serverConfigFileName = process.env.NEOTREE_PRODUCTION_CONFIG_FILE;
}

if (serverType === 'stage') {
  firebaseConfigFileName = process.env.NEOTREE_STAGE_FIREBASE_CONFIG_FILE;
  serverConfigFileName = process.env.NEOTREE_STAGE_CONFIG_FILE;
}

var firebaseConfig = function () {
  try {
    return require(firebaseConfigFileName);
  } catch (e) {
    return require('./firebase.config.json');
  }
}();

try {
  module.exports = (0, _objectSpread2["default"])({
    firebaseConfig: firebaseConfig
  }, require(serverConfigFileName));
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

  reactHotLoader.register(serverType, "serverType", "/home/lamyfarai/Workbench/neotree-editor/_config/server.js");
  reactHotLoader.register(firebaseConfigFileName, "firebaseConfigFileName", "/home/lamyfarai/Workbench/neotree-editor/_config/server.js");
  reactHotLoader.register(serverConfigFileName, "serverConfigFileName", "/home/lamyfarai/Workbench/neotree-editor/_config/server.js");
  reactHotLoader.register(firebaseConfig, "firebaseConfig", "/home/lamyfarai/Workbench/neotree-editor/_config/server.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var serverType = process.env.NEOTREEserver_TYPE || '';
if (serverType) serverType = "".concat(serverType.toUpperCase(), "_");
var firebaseConfigFileName = "".concat(serverType, "NEOTREE_WEBEDITOR_FIREBASEconfig_FILE");
var serverConfigFileName = "".concat(serverType, "NEOTREE_WEBEDITORconfig_FILE");

var firebaseConfig = function () {
  try {
    return require(process.env[firebaseConfigFileName]);
  } catch (e) {
    return require('./firebase.config.json');
  }
}();

try {
  module.exports = _objectSpread({
    firebaseConfig: firebaseConfig
  }, require(process.env[serverConfigFileName]));
} catch (e) {
  module.exports = _objectSpread({
    firebaseConfig: firebaseConfig
  }, require('./server.config'));
}

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(serverType, "serverType", "/home/farai/WorkBench/neotree-editor/config/server.js");
  reactHotLoader.register(firebaseConfigFileName, "firebaseConfigFileName", "/home/farai/WorkBench/neotree-editor/config/server.js");
  reactHotLoader.register(serverConfigFileName, "serverConfigFileName", "/home/farai/WorkBench/neotree-editor/config/server.js");
  reactHotLoader.register(firebaseConfig, "firebaseConfig", "/home/farai/WorkBench/neotree-editor/config/server.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
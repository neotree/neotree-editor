"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var admin = _interopRequireWildcard(require("firebase-admin"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var serviceAccountKeySource = process.env.NEOTREE_FIREBASE_SERVICE_ACCOUNT_KEY || '../_config/firebase-service-account-key.json';

var serviceAccount = require(serviceAccountKeySource);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://".concat(serviceAccount.project_id, ".firebaseio.com")
});
var _default = admin;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(serviceAccountKeySource, "serviceAccountKeySource", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
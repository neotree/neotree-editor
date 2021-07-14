"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.firebaseAdmin = exports.firebase = exports["default"] = exports.firebaseOptions = exports.firebaseAdminOptions = void 0;

require("firebase/auth");

var firebase = _interopRequireWildcard(require("firebase"));

exports.firebase = firebase;

var firebaseAdmin = _interopRequireWildcard(require("firebase-admin"));

exports.firebaseAdmin = firebaseAdmin;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var getParsedValue = function getParsedValue(v) {
  return JSON.parse("\"".concat(v || '', "\""));
};

var firebaseOptions = JSON.parse(JSON.stringify({
  apiKey: getParsedValue(process.env.firebaseSDK_apiKey),
  authDomain: getParsedValue(process.env.firebaseSDK_authDomain),
  databaseURL: getParsedValue(process.env.firebaseSDK_databaseURL),
  projectId: getParsedValue(process.env.firebaseSDK_projectId),
  storageBucket: getParsedValue(process.env.firebaseSDK_storageBucket),
  messagingSenderId: getParsedValue(process.env.firebaseSDK_messagingSenderId),
  appId: getParsedValue(process.env.firebaseSDK_appId),
  measurementId: getParsedValue(process.env.firebaseSDK_measurementId)
}));
exports.firebaseOptions = firebaseOptions;
firebase.initializeApp(firebaseOptions);
var firebaseAdminOptions = JSON.parse(JSON.stringify({
  databaseURL: getParsedValue(process.env.firebaseAdminSDK_databaseURL),
  type: getParsedValue(process.env.firebaseAdminSDK_type),
  project_id: getParsedValue(process.env.firebaseAdminSDK_project_id),
  private_key_id: getParsedValue(process.env.firebaseAdminSDK_private_key_id),
  private_key: getParsedValue(process.env.firebaseAdminSDK_private_key),
  client_email: getParsedValue(process.env.firebaseAdminSDK_client_email),
  client_id: getParsedValue(process.env.firebaseAdminSDK_client_id),
  auth_uri: getParsedValue(process.env.firebaseAdminSDK_auth_uri),
  token_uri: getParsedValue(process.env.firebaseAdminSDK_token_uri),
  auth_provider_x509_cert_url: getParsedValue(process.env.firebaseAdminSDK_auth_provider_x509_cert_url),
  client_x509_cert_url: getParsedValue(process.env.firebaseAdminSDK_client_x509_cert_url)
}));
exports.firebaseAdminOptions = firebaseAdminOptions;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminOptions),
  databaseURL: firebaseAdminOptions.databaseURL || "https://".concat(process.env.firebaseAdminSDK_project_id, ".firebaseio.com")
});
var _default = firebaseAdmin;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(getParsedValue, "getParsedValue", "/home/farai/WorkBench/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(firebaseOptions, "firebaseOptions", "/home/farai/WorkBench/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(firebaseAdminOptions, "firebaseAdminOptions", "/home/farai/WorkBench/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/firebase/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
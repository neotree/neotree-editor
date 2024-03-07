"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.firebaseOptions = exports.firebaseAdminOptions = exports.firebaseAdmin = exports.firebase = exports["default"] = void 0;
require("firebase/auth");
var firebase = _interopRequireWildcard(require("firebase"));
exports.firebase = firebase;
var firebaseAdmin = _interopRequireWildcard(require("firebase-admin"));
exports.firebaseAdmin = firebaseAdmin;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
var firebaseOptions = exports.firebaseOptions = JSON.parse(JSON.stringify({
  apiKey: getParsedValue(process.env.firebaseSDK_apiKey),
  authDomain: getParsedValue(process.env.firebaseSDK_authDomain),
  databaseURL: getParsedValue(process.env.firebaseSDK_databaseURL),
  projectId: getParsedValue(process.env.firebaseSDK_projectId),
  storageBucket: getParsedValue(process.env.firebaseSDK_storageBucket),
  messagingSenderId: getParsedValue(process.env.firebaseSDK_messagingSenderId),
  appId: getParsedValue(process.env.firebaseSDK_appId),
  measurementId: getParsedValue(process.env.firebaseSDK_measurementId)
}));
firebase.initializeApp(firebaseOptions);
var firebaseAdminOptions = exports.firebaseAdminOptions = JSON.parse(JSON.stringify({
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
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminOptions),
  databaseURL: firebaseAdminOptions.databaseURL || "https://".concat(process.env.firebaseAdminSDK_project_id, ".firebaseio.com")
});
var _default = firebaseAdmin;
var _default2 = exports["default"] = _default;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(getParsedValue, "getParsedValue", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(firebaseOptions, "firebaseOptions", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(firebaseAdminOptions, "firebaseAdminOptions", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/firebase/index.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/firebase/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
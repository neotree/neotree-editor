"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var admin = _interopRequireWildcard(require("firebase-admin"));

var getParsedValue = function getParsedValue(v) {
  return JSON.parse("\"".concat(v || '', "\""));
};

var firebaseOpts = JSON.parse(JSON.stringify({
  type: getParsedValue(process.env.firebase_config_type),
  project_id: getParsedValue(process.env.firebase_config_project_id),
  private_key_id: getParsedValue(process.env.firebase_config_private_key_id),
  private_key: getParsedValue(process.env.firebase_config_private_key),
  client_email: getParsedValue(process.env.firebase_config_client_email),
  client_id: getParsedValue(process.env.firebase_config_client_id),
  auth_uri: getParsedValue(process.env.firebase_config_auth_uri),
  token_uri: getParsedValue(process.env.firebase_config_token_uri),
  auth_provider_x509_cert_url: getParsedValue(process.env.firebase_config_auth_provider_x509_cert_url),
  client_x509_cert_url: getParsedValue(process.env.firebase_config_client_x509_cert_url)
}));
admin.initializeApp({
  credential: admin.credential.cert(firebaseOpts),
  databaseURL: "https://".concat(process.env.firebase_config_project_id, ".firebaseio.com")
});
var _default = admin;
exports["default"] = _default;
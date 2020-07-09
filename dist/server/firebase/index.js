"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var admin = _interopRequireWildcard(require("firebase-admin"));

var _server = _interopRequireDefault(require("../../config/server"));

var serviceAccount = _server["default"].firebaseConfig;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://".concat(serviceAccount.project_id, ".firebaseio.com")
});
var _default = admin;
exports["default"] = _default;
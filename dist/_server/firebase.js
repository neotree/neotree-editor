"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.admin = exports.set = exports.update = void 0;

var admin = _interopRequireWildcard(require("firebase-admin"));

exports.admin = admin;

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var serviceAccount = require(process.env.NEOTREE_FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://".concat(serviceAccount.project_id, ".firebaseio.com")
});

var update = function update(refKey, child) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var db = admin.database();
  var ref = db.ref(refKey).child(child);
  ref.update(data);
};

exports.update = update;

var set = function set(refKey, child) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var db = admin.database();
  var ref = db.ref(refKey).child(child);
  ref.set(data);
};

exports.set = set;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(update, "update", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
  reactHotLoader.register(set, "set", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
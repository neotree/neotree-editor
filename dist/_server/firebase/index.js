"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.admin = exports["default"] = exports.save = exports.remove = exports.update = exports.set = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var admin = _interopRequireWildcard(require("firebase-admin"));

exports.admin = admin;

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

var set = function set(collection, key, data) {
  return admin.database().ref(collection).child(key).set(data);
};

exports.set = set;

var update = function update(collection, key, data) {
  return admin.database().ref(collection).child(key).update(data);
};

exports.update = update;

var remove = function remove(collection, child) {
  return admin.database().ref(collection).child(child).remove();
};

exports.remove = remove;

var save = function save(collection, item, payload) {
  return new Promise(function (resolve, reject) {
    admin.database().ref(collection).push().then(function (snap) {
      var data = payload.data,
          rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
      var id = snap.key;
      resolve(id);

      var _data = data ? JSON.parse(data) : null;

      admin.database().ref(collection).child(id).update((0, _objectSpread3["default"])({}, rest, {}, _data, (0, _defineProperty2["default"])({}, "".concat(item, "Id"), id)));
    })["catch"](reject);
  });
};

exports.save = save;
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
  reactHotLoader.register(set, "set", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
  reactHotLoader.register(update, "update", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
  reactHotLoader.register(remove, "remove", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
  reactHotLoader.register(save, "save", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/firebase/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
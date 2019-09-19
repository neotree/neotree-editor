"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.admin = exports.sync = exports.remove = exports.update = exports.set = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var admin = _interopRequireWildcard(require("firebase-admin"));

exports.admin = admin;

var _models = require("./models");

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

var sync = function sync() {
  Promise.all([_models.ConfigKey.findAll({}), _models.Script.findAll({}), _models.Screen.findAll({}), _models.Diagnosis.findAll({})]).then(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
        cKeys = _ref2[0],
        scripts = _ref2[1],
        screens = _ref2[2],
        diagnoses = _ref2[3];

    var promises = [];
    cKeys.forEach(function (item) {
      return promises.push(_models.ConfigKey.update({
        updatedAt: new Date()
      }, {
        where: {
          id: item.id
        },
        individualHooks: true
      }));
    });
    scripts.forEach(function (item) {
      return promises.push(_models.Script.update({
        updatedAt: new Date()
      }, {
        where: {
          id: item.id
        },
        individualHooks: true
      }));
    });
    screens.forEach(function (item) {
      return promises.push(_models.Screen.update({
        updatedAt: new Date()
      }, {
        where: {
          id: item.id
        },
        individualHooks: true
      }));
    });
    diagnoses.forEach(function (item) {
      return promises.push(_models.Diagnosis.update({
        updatedAt: new Date()
      }, {
        where: {
          id: item.id
        },
        individualHooks: true
      }));
    });
    Promise.all(promises);
  });
};

exports.sync = sync;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(set, "set", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
  reactHotLoader.register(update, "update", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
  reactHotLoader.register(remove, "remove", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
  reactHotLoader.register(sync, "sync", "/home/bws/WorkBench/neotree-editor/_server/firebase.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
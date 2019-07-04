"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = function _default(app, _ref, done) {
  var scripts = _ref.scripts,
      author = _ref.author;
  scripts.forEach(function (_ref2, scriptIndex) {
    var screens = _ref2.screens,
        diagnoses = _ref2.diagnoses,
        script = (0, _objectWithoutProperties2["default"])(_ref2, ["screens", "diagnoses"]);
    var isLastScript = scriptIndex === scripts.length - 1;
    var script_id = (0, _uuidv["default"])();

    _models.Script.create({
      id: script_id,
      author: author,
      data: JSON.stringify(script)
    }).then(function () {
      var insertDiagnoses = function insertDiagnoses() {
        return new Promise(function (resolve) {
          diagnoses.forEach(function (_ref3, i) {
            var createdAt = _ref3.createdAt,
                updatedAt = _ref3.updatedAt,
                scriptId = _ref3.scriptId,
                diagnosisId = _ref3.diagnosisId,
                diagnosis = (0, _objectWithoutProperties2["default"])(_ref3, ["createdAt", "updatedAt", "scriptId", "diagnosisId"]);
            // eslint-disable-line
            var isLast = i === diagnoses.length - 1;
            var diagnosis_id = (0, _uuidv["default"])();

            _models.Diagnosis.create({
              id: diagnosis_id,
              script_id: script_id,
              author: author,
              data: JSON.stringify(diagnosis)
            }).then(function () {
              if (isLast) resolve();
              return null;
            })["catch"](function (err) {
              return console.log(err);
            });
          });
        });
      };

      var insertScreens = function insertScreens() {
        return new Promise(function (resolve) {
          screens.forEach(function (_ref4, i) {
            var createdAt = _ref4.createdAt,
                updatedAt = _ref4.updatedAt,
                scriptId = _ref4.scriptId,
                screenId = _ref4.screenId,
                position = _ref4.position,
                type = _ref4.type,
                screen = (0, _objectWithoutProperties2["default"])(_ref4, ["createdAt", "updatedAt", "scriptId", "screenId", "position", "type"]);
            // eslint-disable-line
            var isLast = i === screens.length - 1;
            var screen_id = (0, _uuidv["default"])();

            _models.Screen.create({
              id: screen_id,
              script_id: script_id,
              author: author,
              position: position,
              type: type,
              data: JSON.stringify(screen)
            }).then(function () {
              if (isLast) resolve();
              return null;
            })["catch"](function (err) {
              return console.log(err);
            });
          });
        });
      };

      Promise.all([insertScreens(), insertDiagnoses()]).then(function () {
        return null;
      })["catch"](function (err) {
        return console.log(err);
      });
      if (isLastScript) done();
      return null;
    })["catch"](function (err) {
      return console.log(err);
    });
  });
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/routes/app/importFromFirebaseMiddleware/handleScripts.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
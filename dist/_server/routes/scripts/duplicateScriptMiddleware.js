"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyScript = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

var _duplicateScreenMiddleware = require("../screens/duplicateScreenMiddleware");

var _duplicateDiagnosisMiddleware = require("../diagnoses/duplicateDiagnosisMiddleware");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyScript = function copyScript(_ref) {
  var screens = _ref.screens,
      diagnoses = _ref.diagnoses,
      script = (0, _objectWithoutProperties2["default"])(_ref, ["screens", "diagnoses"]);
  return new Promise(function (resolve, reject) {
    _firebase["default"].database().ref('scripts').push().then(function (snap) {
      var data = script.data,
          rest = (0, _objectWithoutProperties2["default"])(script, ["data"]);
      var scriptId = snap.key;

      _firebase["default"].database().ref("scripts/".concat(scriptId)).set((0, _objectSpread2["default"])({}, rest, {}, data, {
        scriptId: scriptId,
        createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
      })).then(function () {
        _models.Script.create((0, _objectSpread2["default"])({}, script, {
          id: scriptId,
          data: JSON.stringify(script.data)
        })).then(function (script) {
          Promise.all([].concat((0, _toConsumableArray2["default"])(screens.map(function (screen) {
            screen = screen.toJSON();
            return (0, _duplicateScreenMiddleware.copyScreen)((0, _objectSpread2["default"])({}, screen, {
              script_id: script.id,
              data: JSON.stringify(screen.data)
            }));
          })), (0, _toConsumableArray2["default"])(diagnoses.map(function (d) {
            d = d.toJSON();
            return (0, _duplicateDiagnosisMiddleware.copyDiagnosis)((0, _objectSpread2["default"])({}, d, {
              script_id: script.id,
              data: JSON.stringify(d.data)
            }));
          })))).then(function (_ref2) {
            var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
                screens = _ref3[0],
                diagnoses = _ref3[1];

            return resolve({
              script: script,
              screens: screens,
              diagnoses: diagnoses
            });
          })["catch"](function (error) {
            return resolve({
              script: script,
              screens: [],
              diagnoses: [],
              error: error
            });
          });
          return null;
        })["catch"](function (err) {
          return reject(err);
        });
      })["catch"](reject);
    })["catch"](reject);
  });
};

exports.copyScript = copyScript;

var _default = function _default(app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, script) {
      if (script) app.io.emit('create_scripts', {
        scripts: [{
          id: script.id
        }]
      });
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required script "id" is not provided.'
    });
    Promise.all([_models.Script.findOne({
      where: {
        id: id
      }
    }), _models.Screen.findAll({
      where: {
        script_id: id
      }
    }), _models.Diagnosis.findAll({
      where: {
        script_id: id
      }
    })]).then(function (_ref4) {
      var _ref5 = (0, _slicedToArray2["default"])(_ref4, 3),
          s = _ref5[0],
          screens = _ref5[1],
          diagnoses = _ref5[2];

      if (!s) return done({
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      s = s.toJSON();
      copyScript((0, _objectSpread2["default"])({
        screens: screens,
        diagnoses: diagnoses
      }, s)).then(function (_ref6) {
        var script = _ref6.script;
        return done(null, script);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyScript, "copyScript", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/scripts/duplicateScriptMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/scripts/duplicateScriptMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
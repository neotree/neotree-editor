"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyDiagnosis = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyDiagnosis = function copyDiagnosis(diagnosis) {
  return new Promise(function (resolve, reject) {
    _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id)).push().then(function (snap) {
      var data = diagnosis.data,
          rest = (0, _objectWithoutProperties2["default"])(diagnosis, ["data"]);
      var diagnosisId = snap.key;

      _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id, "/").concat(diagnosisId)).set((0, _objectSpread2["default"])({}, rest, {}, data, {
        diagnosisId: diagnosisId,
        scriptId: diagnosis.script_id,
        createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
      })).then(function () {
        _models.Diagnosis.create((0, _objectSpread2["default"])({}, diagnosis, {
          id: diagnosisId,
          data: JSON.stringify(diagnosis.data)
        })).then(function (diagnosis) {
          return resolve(diagnosis);
        })["catch"](function (err) {
          return reject(err);
        });
      })["catch"](reject);
    })["catch"](reject);
  });
};

exports.copyDiagnosis = copyDiagnosis;

var _default = function _default() {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, diagnosis) {
      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });
    Promise.all([_models.Diagnosis.findOne({
      where: {
        id: id
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
          diagnosis = _ref2[0];

      if (!diagnosis) return done({
        msg: "Could not find diagnosis with \"id\" ".concat(id, ".")
      });
      diagnosis = diagnosis.toJSON();
      copyDiagnosis(diagnosis).then(function (diagnosis) {
        return done(null, diagnosis);
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

  reactHotLoader.register(copyDiagnosis, "copyDiagnosis", "/home/bws/WorkBench/neotree-editor/_server/routes/diagnoses/duplicateDiagnosisMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/routes/diagnoses/duplicateDiagnosisMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
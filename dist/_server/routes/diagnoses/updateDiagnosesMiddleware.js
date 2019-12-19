"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.findAndUpdateDiagnoses = exports.updateDiagnoses = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var updateDiagnoses = function updateDiagnoses(diagnoses) {
  var returnUpdated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return new Promise(function (resolve, reject) {
    return Promise.all(diagnoses.map(function (_ref) {
      var id = _ref.id,
          d = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.Diagnosis.update((0, _objectSpread2["default"])({}, d), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      if (!returnUpdated) return resolve({
        rslts: rslts
      });

      _models.Diagnosis.findAll({
        where: {
          id: diagnoses.map(function (d) {
            return d.id;
          })
        },
        order: [['position', 'ASC']]
      }).then(function (diagnoses) {
        return resolve({
          diagnoses: diagnoses
        });
      })["catch"](reject);

      return null;
    })["catch"](reject);
  });
};

exports.updateDiagnoses = updateDiagnoses;

var findAndUpdateDiagnoses = function findAndUpdateDiagnoses() {
  var finder = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var updater = arguments.length > 1 ? arguments[1] : undefined;
  var returnUpdated = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return new Promise(function (resolve, reject) {
    _models.Diagnosis.findAll(finder).then(function (diagnoses) {
      diagnoses = updater(JSON.parse(JSON.stringify(diagnoses)));
      updateDiagnoses(diagnoses, returnUpdated).then(resolve)["catch"](reject);
      return null;
    })["catch"](reject);
  });
};

exports.findAndUpdateDiagnoses = findAndUpdateDiagnoses;

var _default = function _default() {
  return function (req, res, next) {
    var _req$body = req.body,
        diagnoses = _req$body.diagnoses,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    updateDiagnoses(diagnoses, returnUpdated).then(function (payload) {
      return done(null, payload);
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

  reactHotLoader.register(updateDiagnoses, "updateDiagnoses", "/home/bws/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
  reactHotLoader.register(findAndUpdateDiagnoses, "findAndUpdateDiagnoses", "/home/bws/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
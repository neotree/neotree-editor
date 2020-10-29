"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.findAndUpdateDiagnoses = exports.updateDiagnoses = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var updateDiagnoses = function updateDiagnoses(diagnoses) {
  return new Promise(function (resolve, reject) {
    return Promise.all(diagnoses.map(function (_ref) {
      var id = _ref.id,
          d = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.Diagnosis.update(_objectSpread({}, d), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      resolve(rslts.map(function (_ref2) {
        var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
            d = _ref3[1];

        return d[0];
      }));
      return null;
    })["catch"](reject);
  });
};

exports.updateDiagnoses = updateDiagnoses;

var findAndUpdateDiagnoses = function findAndUpdateDiagnoses() {
  var finder = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var updater = arguments.length > 1 ? arguments[1] : undefined;
  return new Promise(function (resolve, reject) {
    _models.Diagnosis.findAll(finder).then(function (diagnoses) {
      diagnoses = updater(JSON.parse(JSON.stringify(diagnoses)));
      updateDiagnoses(diagnoses).then(resolve)["catch"](reject);
      return null;
    })["catch"](reject);
  });
};

exports.findAndUpdateDiagnoses = findAndUpdateDiagnoses;

var _default = function _default(app) {
  return function (req, res, next) {
    var diagnoses = req.body.diagnoses;

    var done = function done(err) {
      var diagnoses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (diagnoses.length) {
        var ds = diagnoses.map(function (d) {
          return {
            diagnosisId: d.diagnosis_id
          };
        });
        app.io.emit('update_diagnoses', {
          diagnoses: ds
        });

        _models.Log.create({
          name: 'update_diagnoses',
          data: JSON.stringify({
            diagnoses: ds
          })
        });
      }

      res.locals.setResponse(err, {
        diagnoses: diagnoses
      });
      next();
      return null;
    };

    updateDiagnoses(diagnoses).then(function (rslts) {
      return done(null, rslts);
    })["catch"](done);
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(updateDiagnoses, "updateDiagnoses", "/home/farai/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
  reactHotLoader.register(findAndUpdateDiagnoses, "findAndUpdateDiagnoses", "/home/farai/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/_server/routes/diagnoses/updateDiagnosesMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
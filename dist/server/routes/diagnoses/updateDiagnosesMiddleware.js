"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.findAndUpdateDiagnoses = exports.updateDiagnoses = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var updateDiagnoses = function updateDiagnoses(diagnoses) {
  var returnUpdated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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

var _default = function _default(app) {
  return function (req, res, next) {
    var _req$body = req.body,
        diagnoses = _req$body.diagnoses,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      app.io.emit('update_diagnoses', {
        diagnoses: diagnoses.map(function (s) {
          return {
            id: s.id
          };
        })
      });
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    updateDiagnoses(diagnoses, returnUpdated).then(function (payload) {
      return done(null, payload);
    })["catch"](done);
  };
};

exports["default"] = _default;
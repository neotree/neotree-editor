"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _models = require("../../models");

var _updateDiagnosesMiddleware = require("./updateDiagnosesMiddleware");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, diagnosis) {
      if (!err) {
        app.io.emit('delete_diagnoses', {
          diagnoses: [{
            id: id
          }]
        });

        _models.Log.create({
          name: 'delete_diagnoses',
          data: JSON.stringify({
            diagnoses: [{
              id: id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });

    _models.Diagnosis.findOne({
      where: {
        id: id
      }
    }).then(function (d) {
      if (!d) return done({
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      d.destroy({
        where: {
          id: id
        }
      }).then(function (deleted) {
        // update diagnoses positions
        (0, _updateDiagnosesMiddleware.findAndUpdateDiagnoses)({
          attributes: ['id'],
          where: {
            script_id: d.script_id
          },
          order: [['position', 'ASC']]
        }, function (diagnoses) {
          return diagnoses.map(function (d, i) {
            return _objectSpread(_objectSpread({}, d), {}, {
              position: i + 1
            });
          });
        }).then(function () {
          return null;
        })["catch"](function (err) {
          app.logger.log(err);
          return null;
        });
        return done(null, {
          deleted: deleted
        });
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};
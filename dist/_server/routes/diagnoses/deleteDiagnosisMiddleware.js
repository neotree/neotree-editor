"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var _updateDiagnosesMiddleware = require("./updateDiagnosesMiddleware");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
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
        }, function (screens) {
          return screens.map(function (scr, i) {
            return (0, _objectSpread2["default"])({}, scr, {
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
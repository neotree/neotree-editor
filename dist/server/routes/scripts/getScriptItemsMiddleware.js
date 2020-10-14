"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _database = require("../../database");

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;

    var done = function done(err, screens, diagnoses) {
      res.locals.setResponse(err, {
        screens: screens,
        diagnoses: diagnoses
      });
      next();
      return null;
    };

    Promise.all([_database.Screen.findAll({
      where: payload,
      order: [['position', 'ASC']]
    }), _database.Diagnosis.findAll({
      where: payload
    })])["catch"](done).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          screens = _ref2[0],
          diagnoses = _ref2[1];

      return done(null, screens, diagnoses);
    });
  };
};
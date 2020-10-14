"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _database = require("../../database");

module.exports = function (app) {
  return function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id"]);

    var done = function done(err, diagnosis) {
      if (diagnosis) app.io.emit('update_diagnoses', {
        key: app.getRandomString(),
        diagnoses: [{
          id: id
        }]
      });
      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });

    _database.Diagnosis.update(payload, {
      where: {
        id: id
      },
      individualHooks: true
    }).then(function (rslts) {
      return done(null, rslts && rslts[1] ? rslts[1][0] : null);
    })["catch"](done);
  };
};
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

module.exports = function (app) {
  return function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id"]);

    var done = function done(err, screen) {
      if (screen) app.io.emit('update_screens', {
        screens: [{
          id: id
        }]
      });
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required screen "id" is not provided.'
    });

    _models.Screen.update(payload, {
      where: {
        id: id
      },
      individualHooks: true
    }).then(function (rslts) {
      return done(null, rslts && rslts[1] ? rslts[1][0] : null);
    })["catch"](done);
  };
};
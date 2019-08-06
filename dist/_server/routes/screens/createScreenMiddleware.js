"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, screen) {
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    _models.Screen.create((0, _objectSpread2["default"])({}, payload, {
      position: 1
    })).then(function (screen) {
      // update screens positions
      (0, _updateScreensMiddleware.findAndUpdateScreens)({
        attributes: ['id'],
        where: {
          script_id: screen.script_id
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
      return done(null, screen);
    })["catch"](done);
  };
};
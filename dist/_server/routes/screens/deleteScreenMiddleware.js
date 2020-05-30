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
    var id = req.body.id;

    var done = function done(err, screen) {
      if (!err) app.io.emit('delete_screens', {
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

    _models.Screen.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      s.destroy({
        where: {
          id: id
        }
      }).then(function (deleted) {
        // update screens positions
        (0, _updateScreensMiddleware.findAndUpdateScreens)({
          attributes: ['id'],
          where: {
            script_id: s.script_id
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
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _database = require("../../database");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, screen) {
      if (!err) {
        app.io.emit('delete_screens', {
          key: app.getRandomString(),
          screens: [{
            id: id
          }]
        });

        _database.Log.create({
          name: 'delete_screens',
          data: JSON.stringify({
            screens: [{
              id: id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required screen "id" is not provided.'
    });

    _database.Screen.findOne({
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
            return _objectSpread(_objectSpread({}, scr), {}, {
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
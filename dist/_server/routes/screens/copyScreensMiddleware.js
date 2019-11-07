"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, items) {
      if (err) app.logger.log(err);
      res.locals.setResponse(err, {
        items: items
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase(payload) {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref("screens/".concat(payload.script_id)).push().then(function (snap) {
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var screenId = snap.key;
          var screen = (0, _objectSpread2["default"])({}, rest, {}, data, {
            screenId: screenId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });

          _firebase["default"].database().ref("screens/".concat(payload.script_id, "/").concat(screenId)).set(screen).then(function () {
            resolve((0, _objectSpread2["default"])({}, rest, {
              id: screenId,
              data: JSON.stringify(screen)
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    _models.Screen.findAll({
      where: {
        id: payload.ids
      }
    }).then(function (screens) {
      Promise.all(screens.map(function (screen) {
        screen = JSON.parse(JSON.stringify(screen));
        var _screen = screen,
            createdAt = _screen.createdAt,
            updateAt = _screen.updateAt,
            id = _screen.id,
            scr = (0, _objectWithoutProperties2["default"])(_screen, ["createdAt", "updateAt", "id"]); // eslint-disable-line

        return saveToFirebase((0, _objectSpread2["default"])({}, scr, {
          script_id: payload.script_id
        }));
      })).then(function (items) {
        return Promise.all(items.map(function (item, i) {
          return _models.Screen.create((0, _objectSpread2["default"])({}, item, {
            position: i + 1
          }));
        })).then(function (items) {
          Promise.all(items.map(function (item) {
            // update screens positions
            return (0, _updateScreensMiddleware.findAndUpdateScreens)({
              attributes: ['id'],
              where: {
                script_id: item.script_id
              },
              order: [['position', 'ASC']]
            }, function (screens) {
              return screens.map(function (scr, i) {
                return (0, _objectSpread2["default"])({}, scr, {
                  position: i + 1
                });
              });
            });
          })).then(function () {
            return done(null, items);
          })["catch"](function () {
            return done(null, items);
          });
        });
      })["catch"](done);
    })["catch"](done);
  };
};
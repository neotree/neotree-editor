"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err) {
      var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      if (err) app.logger.log(err);
      if (items.length) app.io.emit('create_screens', {
        key: app.getRandomString(),
        screens: items.map(function (s) {
          return {
            id: s.id
          };
        })
      });
      res.locals.setResponse(err, {
        items: items
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase(payload) {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref("screens/".concat(payload.script_id)).push().then(function (snap) {
          var _payload$data = payload.data,
              position = _payload$data.position,
              data = (0, _objectWithoutProperties2["default"])(_payload$data, ["position"]),
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]); // eslint-disable-line

          var screenId = snap.key;

          var screen = _objectSpread(_objectSpread(_objectSpread({}, rest), data), {}, {
            screenId: screenId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });

          _firebase["default"].database().ref("screens/".concat(payload.script_id, "/").concat(screenId)).set(screen).then(function () {
            resolve(_objectSpread(_objectSpread({}, rest), {}, {
              screen_id: screenId,
              data: JSON.stringify(screen)
            }));
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    Promise.all([_models.Screen.count({
      where: {
        script_id: payload.script_id
      }
    }), _models.Screen.findAll({
      where: {
        id: payload.ids
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          count = _ref2[0],
          screens = _ref2[1];

      screens = payload.ids.map(function (id) {
        return screens.filter(function (scr) {
          return scr.id === id;
        })[0];
      }).filter(function (scr) {
        return scr;
      });
      Promise.all(screens.map(function (screen, i) {
        screen = JSON.parse(JSON.stringify(screen));
        var _screen = screen,
            createdAt = _screen.createdAt,
            updateAt = _screen.updateAt,
            id = _screen.id,
            screen_id = _screen.screen_id,
            scr = (0, _objectWithoutProperties2["default"])(_screen, ["createdAt", "updateAt", "id", "screen_id"]); // eslint-disable-line

        return saveToFirebase(_objectSpread(_objectSpread({}, scr), {}, {
          position: count + (i + 1),
          script_id: payload.script_id
        }));
      })).then(function (items) {
        return Promise.all(items.map(function (item) {
          return _models.Screen.create(_objectSpread({}, item));
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
                return _objectSpread(_objectSpread({}, scr), {}, {
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
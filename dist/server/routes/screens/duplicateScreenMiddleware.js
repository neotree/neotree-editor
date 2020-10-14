"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyScreen = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../database/firebase"));

var _database = require("../../database");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var copyScreen = function copyScreen(screen) {
  return new Promise(function (resolve, reject) {
    _firebase["default"].database().ref("screens/".concat(screen.script_id)).push().then(function (snap) {
      var data = screen.data,
          rest = (0, _objectWithoutProperties2["default"])(screen, ["data"]);
      var screenId = snap.key;

      _firebase["default"].database().ref("screens/".concat(screen.script_id, "/").concat(screenId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), data), {}, {
        screenId: screenId,
        scriptId: screen.script_id,
        createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
      })).then(function () {
        _database.Screen.create(_objectSpread(_objectSpread({}, screen), {}, {
          screen_id: screenId,
          data: JSON.stringify(screen.data)
        })).then(function (screen) {
          return resolve(screen);
        })["catch"](function (err) {
          return reject(err);
        });
      })["catch"](reject);
    })["catch"](reject);
  });
};

exports.copyScreen = copyScreen;

var _default = function _default(app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, screen) {
      if (screen) app.io.emit('create_screens', {
        key: app.getRandomString(),
        screens: [{
          id: screen.id
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
    Promise.all([_database.Screen.findOne({
      where: {
        id: id
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
          screen = _ref2[0];

      if (!screen) return done({
        msg: "Could not find screen with \"id\" ".concat(id, ".")
      });
      screen = screen.toJSON();
      copyScreen(screen).then(function (screen) {
        // update screens positions
        (0, _updateScreensMiddleware.findAndUpdateScreens)({
          attributes: ['id'],
          where: {
            script_id: screen.script_id
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
        return done(null, screen);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};

exports["default"] = _default;
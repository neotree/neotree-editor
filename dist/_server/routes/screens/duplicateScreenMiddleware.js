"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyScreen = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../models");

var _updateScreensMiddleware = require("./updateScreensMiddleware");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyScreen = function copyScreen(req, screen) {
  return new Promise(function (resolve, reject) {
    _models.Screen.create((0, _objectSpread2["default"])({}, screen, {
      id: (0, _uuidv["default"])(),
      data: JSON.stringify(screen.data)
    })).then(function (screen) {
      return resolve(screen);
    })["catch"](function (err) {
      return reject(err);
    });
  });
};

exports.copyScreen = copyScreen;

var _default = function _default(app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, screen) {
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required screen "id" is not provided.'
    });
    Promise.all([_models.Screen.findOne({
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
      copyScreen(req, screen).then(function (screen) {
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
      return null;
    })["catch"](done);
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyScreen, "copyScreen", "/home/bws/WorkBench/neotree-editor/_server/routes/screens/duplicateScreenMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/routes/screens/duplicateScreenMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
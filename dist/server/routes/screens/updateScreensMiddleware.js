"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.findAndUpdateScreens = exports.updateScreens = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var updateScreens = function updateScreens(screens) {
  var returnUpdated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return new Promise(function (resolve, reject) {
    return Promise.all(screens.map(function (_ref) {
      var id = _ref.id,
          scr = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.Screen.update(_objectSpread({}, scr), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      if (!returnUpdated) return resolve({
        rslts: rslts
      });

      _models.Screen.findAll({
        where: {
          id: screens.map(function (scr) {
            return scr.id;
          })
        },
        order: [['position', 'ASC']]
      }).then(function (screens) {
        return resolve({
          screens: screens
        });
      })["catch"](reject);

      return null;
    })["catch"](reject);
  });
};

exports.updateScreens = updateScreens;

var findAndUpdateScreens = function findAndUpdateScreens() {
  var finder = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var updater = arguments.length > 1 ? arguments[1] : undefined;
  var returnUpdated = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return new Promise(function (resolve, reject) {
    _models.Screen.findAll(finder).then(function (screens) {
      screens = updater(JSON.parse(JSON.stringify(screens)));
      updateScreens(screens, returnUpdated).then(resolve)["catch"](reject);
      return null;
    })["catch"](reject);
  });
};

exports.findAndUpdateScreens = findAndUpdateScreens;

var _default = function _default(app) {
  return function (req, res, next) {
    var _req$body = req.body,
        screens = _req$body.screens,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      app.io.emit('update_screens', {
        key: app.getRandomString(),
        screens: screens.map(function (s) {
          return {
            id: s.id
          };
        })
      });
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    updateScreens(screens, returnUpdated).then(function (payload) {
      return done(null, payload);
    })["catch"](done);
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(updateScreens, "updateScreens", "/home/farai/WorkBench/neotree-editor/server/routes/screens/updateScreensMiddleware.js");
  reactHotLoader.register(findAndUpdateScreens, "findAndUpdateScreens", "/home/farai/WorkBench/neotree-editor/server/routes/screens/updateScreensMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/screens/updateScreensMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
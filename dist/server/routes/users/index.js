"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _express = _interopRequireDefault(require("express"));

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

var router = _express["default"].Router(); //eslint-disable-line


module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/get-users', function (req, res, next) {
    var done = function done(err) {
      var users = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      res.locals.setResponse(err, {
        users: users
      });
      next();
      return null;
    };

    _models.User.findAll({
      attributes: ['id', 'email']
    }).then(function (users) {
      return done(null, users);
    })["catch"](done);
  }, responseMiddleware);
  router.post('/delete-user', function (req, res, next) {
    var done = function done(err, rslt) {
      res.locals.setResponse(err, {
        rslt: rslt
      });
      next();
      return null;
    };

    Promise.all([_models.User.destroy({
      where: {
        id: req.body.id
      }
    }), _models.UserProfile.destroy({
      where: {
        user_id: req.body.id
      }
    })]).then(function (rslt) {
      return done(null, rslt);
    })["catch"](done);
  }, responseMiddleware);
  router.post('/add-user', function (req, res, next) {
    var done = function done(err, user) {
      res.locals.setResponse(err, {
        user: user
      });
      next();
      return null;
    };

    _models.User.create(_objectSpread({}, req.body)).then(function (user) {
      return done(null, user);
    })["catch"](done);
  }, responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/users/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
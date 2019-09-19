"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        scripts = _req$body.scripts,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    Promise.all(scripts.map(function (_ref) {
      var id = _ref.id,
          scr = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.Script.update((0, _objectSpread2["default"])({}, scr), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      if (!returnUpdated) return done(null, {
        rslts: rslts
      });

      _models.Script.findAll({
        where: {
          id: scripts.map(function (scr) {
            return scr.id;
          })
        }
      }).then(function (scripts) {
        return done(null, {
          scripts: scripts
        });
      })["catch"](done);

      return null;
    })["catch"](done);
  };
};
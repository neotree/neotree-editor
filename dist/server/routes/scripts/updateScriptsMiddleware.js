"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app) {
  return function (req, res, next) {
    var _req$body = req.body,
        scripts = _req$body.scripts,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      if (!err) app.io.emit('update_scripts', {
        key: app.getRandomString(),
        scripts: scripts.map(function (s) {
          return {
            id: s.id
          };
        })
      });
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    Promise.all(scripts.map(function (_ref) {
      var id = _ref.id,
          scr = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _database.Script.update(_objectSpread({}, scr), {
        where: {
          id: id
        },
        individualHooks: true
      });
    })).then(function (rslts) {
      if (!returnUpdated) return done(null, {
        rslts: rslts
      });

      _database.Script.findAll({
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
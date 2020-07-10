"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        deleteAssociatedData = _req$body.deleteAssociatedData,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id", "deleteAssociatedData"]);

    var done = function done(err, script) {
      if (!err) {
        app.io.emit('delete_scripts', {
          key: app.getRandomString(),
          scripts: [{
            id: id
          }]
        });

        _models.Log.create({
          name: 'delete_scripts',
          data: JSON.stringify({
            scripts: [{
              id: id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required script "id" is not provided.'
    });

    _models.Script.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      s.destroy({
        id: id
      }).then(function (scripts) {
        if (deleteAssociatedData === false) return done(null, {
          scripts: scripts
        });
        Promise.all([_models.Screen.destroy({
          where: {
            script_id: id
          }
        }), _models.Diagnosis.destroy({
          where: {
            script_id: id
          }
        })]).then(function (associated) {
          return done(null, {
            scripts: scripts,
            associated: associated
          });
        })["catch"](function (err) {
          return done(null, {
            scripts: scripts,
            associatedErrors: err
          });
        });
        return null;
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};
"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, configKey) {
      if (!err) {
        app.io.emit('deleteconfig_keys', {
          config_keys: [{
            id: id
          }]
        });

        _models.Log.create({
          name: 'deleteconfig_keys',
          data: JSON.stringify({
            config_keys: [{
              id: id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required configKey "id" is not provided.'
    });

    _models.ConfigKey.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find configKey with \"id\" ".concat(id, ".")
      });
      s.destroy({
        where: {
          id: id
        }
      }).then(function (deleted) {
        return done(null, {
          deleted: deleted
        });
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};
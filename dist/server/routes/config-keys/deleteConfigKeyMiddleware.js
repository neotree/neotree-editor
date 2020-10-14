"use strict";

var _database = require("../../database");

module.exports = function (app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, configKey) {
      if (!err) {
        app.io.emit('deleteconfig_keys', {
          key: app.getRandomString(),
          config_keys: [{
            id: id
          }]
        });

        _database.Log.create({
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

    _database.ConfigKey.findOne({
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
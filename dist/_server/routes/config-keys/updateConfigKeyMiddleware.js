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
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id"]);

    var done = function done(err, configKey) {
      if (!err) {
        app.io.emit('update_config_keys', {
          configKeys: [{
            configKeyId: id
          }]
        });

        _models.Log.create({
          name: 'update_config_keys',
          data: JSON.stringify({
            configKeys: [{
              configKeyId: id
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

    _models.ConfigKey.update(payload, {
      where: {
        id: id
      },
      individualHooks: true
    }).then(function (configKey) {
      return done(null, configKey);
    })["catch"](done);
  };
};
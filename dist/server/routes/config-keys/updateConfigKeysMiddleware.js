"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _updateConfigKeyMiddleware = require("./updateConfigKeyMiddleware");

var _models = require("../../database/models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var configKeys, done, updatedConfigKeys;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              configKeys = req.body.configKeys;

              done = function done(err, updatedConfigKeys) {
                if (err) {
                  res.locals.setResponse(err);
                  return next();
                }

                app.io.emit('update_config_keys', {
                  key: app.getRandomString(),
                  configKeys: configKeys.map(function (s) {
                    return {
                      configKeyId: s.configKeyId
                    };
                  })
                });

                _models.Log.create({
                  name: 'update_config_keys',
                  data: JSON.stringify({
                    configKeys: configKeys.map(function (s) {
                      return {
                        configKeyId: s.configKeyId
                      };
                    })
                  })
                });

                res.locals.setResponse(null, {
                  updatedConfigKeys: updatedConfigKeys
                });
                next();
              };

              updatedConfigKeys = [];
              _context.prev = 3;
              _context.next = 6;
              return Promise.all(configKeys.map(function (s) {
                return (0, _updateConfigKeyMiddleware.updateConfigKey)(s);
              }));

            case 6:
              updatedConfigKeys = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              done(null, updatedConfigKeys);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};
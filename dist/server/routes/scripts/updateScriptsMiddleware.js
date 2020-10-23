"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _updateScriptMiddleware = require("./updateScriptMiddleware");

var _models = require("../../database/models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scripts, done, updatedScripts;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              scripts = req.body.scripts;

              done = function done(err, updatedScripts) {
                if (err) {
                  res.locals.setResponse(err);
                  return next();
                }

                app.io.emit('update_scripts', {
                  key: app.getRandomString(),
                  scripts: scripts.map(function (s) {
                    return {
                      scriptId: s.scriptId
                    };
                  })
                });

                _models.Log.create({
                  name: 'update_scripts',
                  data: JSON.stringify({
                    scripts: scripts.map(function (s) {
                      return {
                        scriptId: s.scriptId
                      };
                    })
                  })
                });

                res.locals.setResponse(null, {
                  updatedScripts: updatedScripts
                });
                next();
              };

              updatedScripts = [];
              _context.prev = 3;
              _context.next = 6;
              return Promise.all(scripts.map(function (s) {
                return (0, _updateScriptMiddleware.updateScript)(s);
              }));

            case 6:
              updatedScripts = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              done(null, updatedScripts);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};
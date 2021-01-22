"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _models = require("../../database/models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, _scripts, deleteAssociatedData, done, scripts, rslts, deletedAt, activeScripts, deletedScripts;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$body = req.body, _scripts = _req$body.scripts, deleteAssociatedData = _req$body.deleteAssociatedData;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                res.locals.setResponse(err, {
                  scripts: rslts
                });
                next();
              };

              scripts = [];
              _context.prev = 3;
              _context.next = 6;
              return _models.Script.findAll({
                where: {
                  id: _scripts.map(function (s) {
                    return s.id;
                  })
                }
              });

            case 6:
              scripts = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              rslts = {};
              deletedAt = new Date();
              _context.prev = 14;
              _context.next = 17;
              return _models.Script.update({
                deletedAt: deletedAt
              }, {
                where: {
                  id: scripts.map(function (s) {
                    return s.id;
                  })
                }
              });

            case 17:
              rslts.scripts = _context.sent;
              _context.next = 20;
              return _models.Script.findAll({
                where: {
                  deletedAt: null
                },
                order: [['position', 'ASC']]
              });

            case 20:
              activeScripts = _context.sent;
              _context.next = 23;
              return Promise.all(activeScripts.map(function (s, i) {
                return _models.Script.update({
                  position: i + 1
                }, {
                  where: {
                    id: s.id
                  }
                });
              }));

            case 23:
              _context.next = 25;
              return _models.Script.findAll({
                where: {
                  deletedAt: {
                    $not: null
                  }
                },
                order: [['position', 'ASC']]
              });

            case 25:
              deletedScripts = _context.sent;
              _context.next = 28;
              return Promise.all(deletedScripts.map(function (s, i) {
                return _models.Script.update({
                  position: activeScripts.length + i + 1
                }, {
                  where: {
                    id: s.id
                  }
                });
              }));

            case 28:
              _context.next = 33;
              break;

            case 30:
              _context.prev = 30;
              _context.t1 = _context["catch"](14);
              return _context.abrupt("return", done(_context.t1));

            case 33:
              if (!(deleteAssociatedData !== false)) {
                _context.next = 50;
                break;
              }

              _context.prev = 34;
              _context.next = 37;
              return _models.Screen.update({
                deletedAt: deletedAt
              }, {
                where: {
                  script_id: scripts.map(function (s) {
                    return s.script_id;
                  })
                }
              });

            case 37:
              rslts.screens = _context.sent;
              _context.next = 42;
              break;

            case 40:
              _context.prev = 40;
              _context.t2 = _context["catch"](34);

            case 42:
              _context.prev = 42;
              _context.next = 45;
              return _models.Diagnosis.update({
                deletedAt: deletedAt
              }, {
                where: {
                  script_id: scripts.map(function (s) {
                    return s.script_id;
                  })
                }
              });

            case 45:
              rslts.diagnoses = _context.sent;
              _context.next = 50;
              break;

            case 48:
              _context.prev = 48;
              _context.t3 = _context["catch"](42);

            case 50:
              done(null, rslts);

            case 51:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9], [14, 30], [34, 40], [42, 48]]);
    }))();
  };
};
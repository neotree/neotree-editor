"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _models = require("../../database/models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _screens, done, rslts, deletedAt, screens, scriptIds;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _screens = req.body.screens;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                res.locals.setResponse(err, {
                  screens: rslts
                });
                next();
              };

              rslts = null;
              deletedAt = new Date();
              screens = [];
              _context2.prev = 5;
              _context2.next = 8;
              return _models.Screen.findAll({
                where: {
                  id: _screens.map(function (s) {
                    return s.id;
                  })
                }
              });

            case 8:
              screens = _context2.sent;
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](5);
              return _context2.abrupt("return", done(_context2.t0));

            case 14:
              _context2.prev = 14;
              _context2.next = 17;
              return _models.Screen.update({
                deletedAt: deletedAt
              }, {
                where: {
                  id: _screens.map(function (s) {
                    return s.id;
                  })
                }
              });

            case 17:
              rslts = _context2.sent;
              scriptIds = screens.map(function (s) {
                return s.script_id;
              }).reduce(function (acc, scriptId) {
                if (acc.includes(scriptId)) return acc;
                return [].concat((0, _toConsumableArray2["default"])(acc), [scriptId]);
              }, []);
              _context2.next = 21;
              return Promise.all(scriptIds.map(function (script_id) {
                return new Promise(function (resolve) {
                  (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                    var activeScreens, deletedScreens;
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return _models.Screen.findAll({
                              where: {
                                script_id: script_id,
                                deletedAt: null
                              },
                              order: [['position', 'ASC']]
                            });

                          case 3:
                            activeScreens = _context.sent;
                            _context.next = 6;
                            return Promise.all(activeScreens.map(function (s, i) {
                              return _models.Screen.update({
                                position: i + 1
                              }, {
                                where: {
                                  id: s.id
                                }
                              });
                            }));

                          case 6:
                            _context.next = 8;
                            return _models.Screen.findAll({
                              where: {
                                script_id: script_id,
                                deletedAt: {
                                  $not: null
                                }
                              },
                              order: [['position', 'ASC']]
                            });

                          case 8:
                            deletedScreens = _context.sent;
                            _context.next = 11;
                            return Promise.all(deletedScreens.map(function (s, i) {
                              return _models.Screen.update({
                                position: activeScreens.length + i + 1
                              }, {
                                where: {
                                  id: s.id
                                }
                              });
                            }));

                          case 11:
                            _context.next = 15;
                            break;

                          case 13:
                            _context.prev = 13;
                            _context.t0 = _context["catch"](0);

                          case 15:
                            resolve();

                          case 16:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, null, [[0, 13]]);
                  }))();
                });
              }));

            case 21:
              _context2.next = 26;
              break;

            case 23:
              _context2.prev = 23;
              _context2.t1 = _context2["catch"](14);
              return _context2.abrupt("return", done(_context2.t1));

            case 26:
              done(null, rslts);

            case 27:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[5, 11], [14, 23]]);
    }))();
  };
};
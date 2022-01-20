"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importScripts = importScripts;
exports.getImportScripts = getImportScripts;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _https = _interopRequireDefault(require("https"));

var _http = _interopRequireDefault(require("http"));

var _database = require("../../database");

var _createScriptMiddleware = require("./createScriptMiddleware");

var _createScreenMiddleware = require("../screens/createScreenMiddleware");

var _createDiagnosisMiddleware = require("../diagnoses/createDiagnosisMiddleware");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

function importScripts(app) {
  return function (req, res, next) {
    var _req$body = req.body,
        url = _req$body.url,
        scriptId = _req$body.scriptId;
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              ((url || '').match('https') ? _https["default"] : _http["default"]).get("".concat(url, "/get-import-scripts?scriptId=").concat(scriptId), function (resp) {
                var _data = '';
                resp.on('data', function (chunk) {
                  _data += chunk;
                });
                resp.on('end', function () {
                  var data = null;
                  var error = null;

                  try {
                    data = _data ? JSON.parse(_data) : {};
                  } catch (e) {
                    error = 'Failed to import, make sure the URL is correct';
                  }

                  res.locals.setResponse(error, {
                    data: data
                  });
                  next();
                });
              }).on('error', function (e) {
                res.locals.setResponse(e.message);
                next();
              });

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  };
}

function getImportScripts(app) {
  return function (req, res, next) {
    var scriptId = req.query.scriptId;
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      var where, scripts, data;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              where = {
                deletedAt: null
              };
              if (scriptId) where.script_id = scriptId;
              _context5.next = 4;
              return _database.Script.findAll({
                where: where
              });

            case 4:
              scripts = _context5.sent;
              _context5.next = 7;
              return Promise.all(scripts.map(function (s) {
                return new Promise(function (resolve) {
                  (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
                    var screens, diagnoses, newScript, saveScreens, saveDiagnoses;
                    return _regenerator["default"].wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.next = 2;
                            return _database.Screen.findAll({
                              where: {
                                deletedAt: null,
                                script_id: s.script_id
                              },
                              order: [['position', 'ASC']]
                            });

                          case 2:
                            screens = _context4.sent;
                            _context4.next = 5;
                            return _database.Diagnosis.findAll({
                              where: {
                                deletedAt: null,
                                script_id: s.script_id
                              },
                              order: [['position', 'ASC']]
                            });

                          case 5:
                            diagnoses = _context4.sent;
                            delete s.data.id;
                            _context4.next = 9;
                            return (0, _createScriptMiddleware.createScript)(s.data);

                          case 9:
                            newScript = _context4.sent;

                            if (!newScript) {
                              _context4.next = 17;
                              break;
                            }

                            saveScreens = /*#__PURE__*/function () {
                              var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                                var _screens,
                                    saved,
                                    s,
                                    newScreen,
                                    _args2 = arguments;

                                return _regenerator["default"].wrap(function _callee2$(_context2) {
                                  while (1) {
                                    switch (_context2.prev = _context2.next) {
                                      case 0:
                                        _screens = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : screens;
                                        saved = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : [];
                                        s = _screens.shift();
                                        _context2.prev = 3;
                                        delete s.data.id;
                                        _context2.next = 7;
                                        return (0, _createScreenMiddleware.createScreen)(_objectSpread(_objectSpread({}, s.data), {}, {
                                          scriptId: newScript.script_id
                                        }));

                                      case 7:
                                        newScreen = _context2.sent;
                                        if (newScreen) saved.push(newScreen);
                                        _context2.next = 13;
                                        break;

                                      case 11:
                                        _context2.prev = 11;
                                        _context2.t0 = _context2["catch"](3);

                                      case 13:
                                        if (!_screens.length) {
                                          _context2.next = 17;
                                          break;
                                        }

                                        _context2.next = 16;
                                        return saveScreens(_screens, saved);

                                      case 16:
                                        saved = _context2.sent;

                                      case 17:
                                        return _context2.abrupt("return", saved);

                                      case 18:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                }, _callee2, null, [[3, 11]]);
                              }));

                              return function saveScreens() {
                                return _ref4.apply(this, arguments);
                              };
                            }();

                            _context4.next = 14;
                            return saveScreens();

                          case 14:
                            saveDiagnoses = /*#__PURE__*/function () {
                              var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
                                var _diagnoses,
                                    saved,
                                    d,
                                    newScreen,
                                    _args3 = arguments;

                                return _regenerator["default"].wrap(function _callee3$(_context3) {
                                  while (1) {
                                    switch (_context3.prev = _context3.next) {
                                      case 0:
                                        _diagnoses = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : diagnoses;
                                        saved = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : [];
                                        d = _diagnoses.shift();
                                        _context3.prev = 3;
                                        delete d.data.id;
                                        _context3.next = 7;
                                        return (0, _createDiagnosisMiddleware.createDiagnosis)(_objectSpread(_objectSpread({}, d.data), {}, {
                                          scriptId: newScript.script_id
                                        }));

                                      case 7:
                                        newScreen = _context3.sent;
                                        if (newScreen) saved.push(newScreen);
                                        _context3.next = 13;
                                        break;

                                      case 11:
                                        _context3.prev = 11;
                                        _context3.t0 = _context3["catch"](3);

                                      case 13:
                                        if (!_diagnoses.length) {
                                          _context3.next = 17;
                                          break;
                                        }

                                        _context3.next = 16;
                                        return saveDiagnoses(_diagnoses, saved);

                                      case 16:
                                        saved = _context3.sent;

                                      case 17:
                                        return _context3.abrupt("return", saved);

                                      case 18:
                                      case "end":
                                        return _context3.stop();
                                    }
                                  }
                                }, _callee3, null, [[3, 11]]);
                              }));

                              return function saveDiagnoses() {
                                return _ref5.apply(this, arguments);
                              };
                            }();

                            _context4.next = 17;
                            return saveDiagnoses();

                          case 17:
                            resolve(newScript);

                          case 18:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }))();
                });
              }));

            case 7:
              data = _context5.sent;
              res.locals.setResponse(null, data);
              next();

            case 10:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
  };
}

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(importScripts, "importScripts", "/home/farai/WorkBench/neotree-editor/server/routes/scripts/importScripts.js");
  reactHotLoader.register(getImportScripts, "getImportScripts", "/home/farai/WorkBench/neotree-editor/server/routes/scripts/importScripts.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
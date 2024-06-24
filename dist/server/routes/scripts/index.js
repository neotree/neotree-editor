"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _express = _interopRequireDefault(require("express"));
var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/scripts"));
var _database = require("../../database");
var _importScripts = require("./importScripts");
var _createScriptMiddleware = require("./createScriptMiddleware");
var _excluded = ["data"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var router = _express["default"].Router();
module.exports = function (app) {
  router.get('/script-labels', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scriptIds, data, _iterator, _step, _loop, filename, mimetype;
      return _regenerator["default"].wrap(function _callee$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            scriptIds = "".concat(req.query.scriptId || '').split(',');
            data = {};
            _iterator = _createForOfIteratorHelper(scriptIds);
            _context2.prev = 4;
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
              var scriptId, res, screens;
              return _regenerator["default"].wrap(function _loop$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    scriptId = _step.value;
                    data[scriptId] = [];
                    _context.next = 4;
                    return _database.Screen.findAll({
                      where: {
                        script_id: scriptId,
                        deletedAt: null
                      },
                      order: [['position', 'ASC']]
                    });
                  case 4:
                    res = _context.sent;
                    screens = res.map(function (screen) {
                      var _JSON$parse = JSON.parse(JSON.stringify(screen)),
                        data = _JSON$parse.data,
                        s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
                      return _objectSpread(_objectSpread({}, data), s);
                    });
                    screens.forEach(function (s) {
                      var metadata = s.metadata || {};
                      var items = metadata.items || [];
                      var fields = metadata.fields || [];
                      switch (s.type) {
                        case 'yesno':
                          data[scriptId].push({
                            key: metadata.key,
                            type: 'yesno',
                            labels: [metadata.positiveLabel || 'Yes', metadata.negativeLabel || 'No'],
                            values: ['Yes', 'No']
                          });
                          break;
                        case 'checklist':
                          items.forEach(function (item) {
                            return data[scriptId].push({
                              key: item.key,
                              type: 'checklist',
                              labels: [item.label],
                              values: [item.label]
                            });
                          });
                          break;
                        case 'multi_select':
                          data[scriptId].push(_objectSpread({
                            key: metadata.key
                          }, items.reduce(function (acc, item) {
                            return _objectSpread(_objectSpread({}, acc), {}, {
                              type: 'mult_select',
                              values: [].concat((0, _toConsumableArray2["default"])(acc.values), [item.id]),
                              labels: [].concat((0, _toConsumableArray2["default"])(acc.labels), [item.label])
                            });
                          }, {
                            values: [],
                            labels: []
                          })));
                          break;
                        case 'single_select':
                          data[scriptId].push(_objectSpread({
                            key: metadata.key,
                            type: 'single_select'
                          }, items.reduce(function (acc, item) {
                            return _objectSpread(_objectSpread({}, acc), {}, {
                              values: [].concat((0, _toConsumableArray2["default"])(acc.values), [item.id]),
                              labels: [].concat((0, _toConsumableArray2["default"])(acc.labels), [item.label])
                            });
                          }, {
                            values: [],
                            labels: []
                          })));
                          break;
                        case 'form':
                          fields.forEach(function (field) {
                            var fieldsTypes = {
                              DATE: 'date',
                              DATETIME: 'datetime',
                              DROPDOWN: 'dropdown',
                              NUMBER: 'number',
                              PERIOD: 'period',
                              TEXT: 'text',
                              TIME: 'time'
                            };
                            var opts = (field.values || '').split('\n').map(function () {
                              var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                              return v.trim();
                            }).filter(function (v) {
                              return v;
                            }).map(function (v) {
                              v = v.split(',');
                              return {
                                value: v[0],
                                label: v[1]
                              };
                            });
                            switch (field.type) {
                              case fieldsTypes.NUMBER:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'number',
                                  labels: [],
                                  values: []
                                });
                                break;
                              case fieldsTypes.DATE:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'date',
                                  labels: [],
                                  values: []
                                });
                                break;
                              case fieldsTypes.DATETIME:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'datetime',
                                  labels: [],
                                  values: []
                                });
                                break;
                              case fieldsTypes.DROPDOWN:
                                data[scriptId].push({
                                  key: field.key,
                                  labels: opts.map(function (o) {
                                    return o.label;
                                  }),
                                  values: opts.map(function (o) {
                                    return o.value;
                                  })
                                });
                                break;
                              case fieldsTypes.PERIOD:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'number',
                                  labels: [],
                                  values: []
                                });
                                break;
                              case fieldsTypes.TEXT:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'text',
                                  labels: [],
                                  values: []
                                });
                                break;
                              case fieldsTypes.TIME:
                                data[scriptId].push({
                                  key: field.key,
                                  type: 'time',
                                  labels: [],
                                  values: []
                                });
                                break;
                              default:
                                break;
                            }
                          });
                          break;
                        case 'timer':
                          data[scriptId].push({
                            values: [],
                            labels: [],
                            key: metadata.key,
                            type: 'number'
                          });
                          break;
                        case 'progress':
                          break;
                        case 'management':
                          break;
                        case 'list':
                          break;
                        case 'diagnosis':
                          break;
                        case 'zw_edliz_summary_table':
                          break;
                        case 'mwi_edliz_summary_table':
                          break;
                        case 'edliz_summary_table':
                          break;
                        default:
                        // do nothing
                      }
                    });
                  case 7:
                  case "end":
                    return _context.stop();
                }
              }, _loop);
            });
            _iterator.s();
          case 7:
            if ((_step = _iterator.n()).done) {
              _context2.next = 11;
              break;
            }
            return _context2.delegateYield(_loop(), "t0", 9);
          case 9:
            _context2.next = 7;
            break;
          case 11:
            _context2.next = 16;
            break;
          case 13:
            _context2.prev = 13;
            _context2.t1 = _context2["catch"](4);
            _iterator.e(_context2.t1);
          case 16:
            _context2.prev = 16;
            _iterator.f();
            return _context2.finish(16);
          case 19:
            filename = "".concat(scriptIds.join('_'), ".json");
            mimetype = 'application/json';
            res.setHeader('Content-disposition', "attachment; filename=".concat(filename));
            res.setHeader('Content-type', mimetype);
            res.json(scriptIds.length > 1 ? data : Object.values(data)[0]);
            _context2.next = 29;
            break;
          case 26:
            _context2.prev = 26;
            _context2.t2 = _context2["catch"](0);
            res.status(500).json({
              error: _context2.t2.message
            });
          case 29:
          case "end":
            return _context2.stop();
        }
      }, _callee, null, [[0, 26], [4, 13, 16, 19]]);
    }))();
  });
  router.post('/import-scripts', (0, _importScripts.importScripts)(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.get('/get-import-scripts', (0, _importScripts.getImportScripts)(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_SCRIPT_DIAGNOSES_SCREENS, function (req, res) {
    var script_id = req.query.script_id;
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var count;
      return _regenerator["default"].wrap(function _callee2$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return _database.Screen.count({
              where: {
                type: 'diagnosis',
                script_id: script_id,
                deletedAt: null
              }
            });
          case 3:
            count = _context3.sent;
            res.json({
              count: count
            });
            _context3.next = 10;
            break;
          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            res.json({
              error: _context3.t0.message
            });
          case 10:
          case "end":
            return _context3.stop();
        }
      }, _callee2, null, [[0, 7]]);
    }))();
  });
  router.get(endpoints.GET_SCRIPTS, require('./getScriptsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_SCRIPT, require('./getScriptMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_SCRIPT_ITEMS, require('./getScriptItemsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.CREATE_SCRIPT, (0, _createScriptMiddleware.createScriptMiddleware)(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_SCRIPT, require('./updateScriptMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_SCRIPTS, require('./updateScriptsMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_SCRIPTS, require('./deleteScriptsMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.DUPLICATE_SCRIPTS, require('./duplicateScriptsMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  return router;
};
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(router, "router", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/scripts/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
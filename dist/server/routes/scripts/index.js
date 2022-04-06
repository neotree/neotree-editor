"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/scripts"));

var _database = require("../../database");

var _importScripts = require("./importScripts");

var _createScriptMiddleware = require("./createScriptMiddleware");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.post('/import-scripts', (0, _importScripts.importScripts)(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.get('/get-import-scripts', (0, _importScripts.getImportScripts)(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_SCRIPT_DIAGNOSES_SCREENS, function (req, res) {
    var script_id = req.query.script_id;
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var count;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _database.Screen.count({
                where: {
                  type: 'diagnosis',
                  script_id: script_id,
                  deletedAt: null
                }
              });

            case 3:
              count = _context.sent;
              res.json({
                count: count
              });
              _context.next = 10;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              res.json({
                error: _context.t0.message
              });

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 7]]);
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

  reactHotLoader.register(router, "router", "/home/farai/Workbench/neotree-editor/server/routes/scripts/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
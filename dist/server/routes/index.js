"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var database = _interopRequireWildcard(require("../database"));

var _backupData = _interopRequireWildcard(require("../utils/backupData"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/get-backup-status', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var appInfo, _shouldBackup;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return database.App.findOne({
                where: {
                  id: 1
                }
              });

            case 3:
              appInfo = _context.sent;
              _context.next = 6;
              return (0, _backupData.shouldBackup)();

            case 6:
              _shouldBackup = _context.sent;
              res.json({
                shouldBackup: _shouldBackup,
                appInfo: appInfo
              });
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](0);
              res.json({
                errors: [_context.t0.message]
              });

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 10]]);
    }))();
  });
  router.post('/publish', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var appInfo, _shouldBackup;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return (0, _backupData["default"])(app);

            case 3:
              _context2.next = 5;
              return database.App.findOne({
                id: 1
              });

            case 5:
              appInfo = _context2.sent;
              _context2.next = 8;
              return (0, _backupData.shouldBackup)();

            case 8:
              _shouldBackup = _context2.sent;
              res.json({
                shouldBackup: _shouldBackup,
                appInfo: appInfo
              });
              _context2.next = 15;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](0);
              res.json({
                errors: [_context2.t0.message]
              });

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 12]]);
    }))();
  });
  router.get('/get-view-mode', function (req, res) {
    return res.json({
      mode: req.session.viewMode || 'view'
    });
  });
  router.post('/set-view-mode', function (req, res) {
    req.session.viewMode = req.body.viewMode;
    res.json({
      viewMode: req.session.viewMode || 'view'
    });
  });
  return router.use(require('./auth')(app)).use(require('./data')(app)).use('/api', require('./api')(app)).use(require('./files')(app)).use(require('./users')(app)).use(require('./scripts')(app)).use(require('./screens')(app)).use(require('./diagnoses')(app)).use(require('./config-keys')(app)).use(require('./devices')(app)).use(require('./hospitals')(app));
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
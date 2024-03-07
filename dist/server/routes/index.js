"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _express = _interopRequireDefault(require("express"));
var _http = _interopRequireDefault(require("http"));
var _https = _interopRequireDefault(require("https"));
var database = _interopRequireWildcard(require("../database"));
var _backup = require("../utils/backup");
var _addStatsMiddleware = require("./addStatsMiddleware");
var _excluded = ["data"],
  _excluded2 = ["id"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var router = _express["default"].Router();
module.exports = function (app) {
  router.use(require('./auth')(app)).use(require('./data')(app)).use('/api', require('./api')(app)).use(require('./files')(app)).use(require('./users')(app)).use(require('./scripts')(app)).use(require('./screens')(app)).use(require('./diagnoses')(app)).use(require('./config-keys')(app)).use(require('./devices')(app)).use(require('./hospitals')(app));
  router.get('/get-app-info', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var appInfo, _shouldBackup;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
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
            return (0, _backup.shouldBackup)();
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
      }, _callee, null, [[0, 10]]);
    }))();
  });
  router.get('/remove-confidential-data', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var screensRes, screens, confidentialKeysMap, keys;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            console.log('getting screens...');
            _context2.next = 4;
            return database.Screen.findAll({
              where: {
                deletedAt: null
              }
            });
          case 4:
            screensRes = _context2.sent;
            screens = screensRes.map(function (screen) {
              var _JSON$parse = JSON.parse(JSON.stringify(screen)),
                data = _JSON$parse.data,
                s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
              return _objectSpread(_objectSpread({}, data), s);
            });
            console.log(screens.length + ' screens found...');
            confidentialKeysMap = screens.reduce(function (acc, item) {
              var metadata = _objectSpread({
                fields: [],
                items: []
              }, item.metadata);
              var fields = metadata.fields;
              var items = metadata.items;
              fields.forEach(function (f) {
                if (f.confidential) acc[f.key] = true;
              });
              items.forEach(function (f) {
                if (f.confidential) acc[f.key] = true;
              });
              if (metadata.confidential && metadata.key) acc[metadata.key] = true;
              return acc;
            }, {});
            keys = Object.keys(confidentialKeysMap);
            res.json({
              keys: keys
            });
            // console.log('posting to ' + `${process.env.NODEAPI_URL}/remove-confidential-data`, { keys });
            // const _fetch = `${process.env.NODEAPI_URL}`.substring(0, 5) === 'https' ? https : http;
            // _fetch.request(`${process.env.NODEAPI_URL}/remove-confidential-data`, { 
            // 	method: 'POST', 
            // 	body: JSON.stringify({ keys }),
            // 	headers: { 'Content-type': 'application/json; charset=UTF-8', Connection: 'keep-alive', }, 
            // }, (resp) => {
            // 	// The whole response has been received. Print out the result.
            // 	resp.on('end', () => {
            // 		res.json({ success: true, });
            // 	});

            // }).on("error", (error) => {
            // 	res.json({ error });
            // });
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
      }, _callee2, null, [[0, 12]]);
    }))();
  });
  router.get('/test-countly', _addStatsMiddleware.testCounty);
  router.post('/update-app-info', function (req, res) {
    var _req$body = req.body,
      id = _req$body.id,
      payload = (0, _objectWithoutProperties2["default"])(_req$body, _excluded2);
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var appInfo;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return database.App.update(_objectSpread({}, payload), {
              where: {
                id: id
              }
            });
          case 3:
            _context3.next = 5;
            return database.App.findOne({
              where: {
                id: id
              }
            });
          case 5:
            appInfo = _context3.sent;
            res.json({
              appInfo: appInfo
            });
            _context3.next = 12;
            break;
          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](0);
            res.json({
              errors: [_context3.t0.message]
            });
          case 12:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[0, 9]]);
    }))();
  });
  router.post('/publish-changes', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var appInfo, _shouldBackup;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return (0, _backup.backupData)(app, req);
          case 3:
            _context4.next = 5;
            return database.App.findOne({
              id: 1
            });
          case 5:
            appInfo = _context4.sent;
            _context4.next = 8;
            return (0, _backup.shouldBackup)();
          case 8:
            _shouldBackup = _context4.sent;
            app.io.emit('data_published');
            res.json({
              shouldBackup: _shouldBackup,
              appInfo: appInfo
            });
            _context4.next = 16;
            break;
          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            res.json({
              errors: [_context4.t0.message]
            });
          case 16:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[0, 13]]);
    }))();
  });
  router.post('/discard-changes', function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      var appInfo, _shouldBackup;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return (0, _backup.restoreBackup)(app);
          case 3:
            _context5.next = 5;
            return database.App.findOne({
              id: 1
            });
          case 5:
            appInfo = _context5.sent;
            _context5.next = 8;
            return (0, _backup.shouldBackup)();
          case 8:
            _shouldBackup = _context5.sent;
            app.io.emit('changes_discarded');
            res.json({
              shouldBackup: _shouldBackup,
              appInfo: appInfo
            });
            _context5.next = 16;
            break;
          case 13:
            _context5.prev = 13;
            _context5.t0 = _context5["catch"](0);
            res.json({
              errors: [_context5.t0.message]
            });
          case 16:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 13]]);
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
  return router;
};
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(router, "router", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
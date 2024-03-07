"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
exports.testCounty = testCounty;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var database = _interopRequireWildcard(require("../database"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
}; // import Countly from 'countly-sdk-nodejs';
var Countly = require("countly-sdk-nodejs").Bulk;
var hasEnvVariables = process.env.COUNTLY_APP_KEY && process.env.COUNTLY_HOST;
var countlyServer = null;
if (hasEnvVariables) {
  countlyServer = new Countly({
    app_key: process.env.COUNTLY_APP_KEY,
    url: process.env.COUNTLY_HOST,
    debug: true
  });
  if (countlyServer) countlyServer.start();
}
function testCounty(_, res) {
  countlyServer.add_bulk_request([{
    begin_session: 1,
    device_id: 'user@email.com'
  }, {
    metrics: {
      _os: 'android'
    },
    device_id: 'device_id',
    events: JSON.stringify({
      key: 'Test1',
      count: 1
    })
  }, {
    metrics: {
      _os: 'android'
    },
    device_id: 'device_id',
    events: JSON.stringify({
      key: 'Test2',
      count: 1
    })
  }, {
    metrics: {
      _os: 'android'
    },
    device_id: 'device_id',
    events: JSON.stringify({
      key: 'Test3',
      count: 1
    })
  }]);
  res.json({
    status: 'ok'
  });
}
var _default = function _default(req, res) {
  (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var appInfo, stats;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return database.App.findOne({
            where: {
              id: 1
            }
          });
        case 2:
          appInfo = _context.sent;
          if (!(countlyServer && hasEnvVariables && appInfo && !appInfo.should_track_usage)) {
            _context.next = 5;
            break;
          }
          return _context.abrupt("return", res.json({
            success: true
          }));
        case 5:
          stats = req.body.stats || [];
          console.log(stats);

          // stats.forEach(stat => {
          //     countlyServer.add_request({ 
          //         begin_session: 1, 
          //         metrics:{ _os: req.body.device, }, 
          //         device_id: req.body.user, 
          //         events: [{
          //             key: stat.data.screenTitle || stat.data.screenId,
          //             count: stat.count,
          //             // dur: stat.duration,
          //             // timestamp: stat.timestamp || new Date().getTime(),
          //         }],
          //     });
          // });

          countlyServer.add_bulk_request([{
            begin_session: 1,
            device_id: req.body.user
          }].concat((0, _toConsumableArray2["default"])(stats.map(function (stat, i) {
            return {
              metrics: {
                _os: req.body.device
              },
              device_id: req.body.user,
              events: JSON.stringify({
                key: stat.data.screenTitle || stat.data.screenId,
                count: stat.count
                // dur: stat.duration,
                // timestamp: stat.timestamp || new Date().getTime(),
              })
            };
          }))));
          res.json({
            success: true
          });
        case 9:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }))();
};
var _default2 = exports["default"] = _default;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(Countly, "Countly", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(hasEnvVariables, "hasEnvVariables", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(countlyServer, "countlyServer", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(testCounty, "testCounty", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/addStatsMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
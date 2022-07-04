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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

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
      while (1) {
        switch (_context.prev = _context.next) {
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
            console.log(stats); // stats.forEach(stat => {
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
                  count: stat.count // dur: stat.duration,
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
      }
    }, _callee);
  }))();
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Countly, "Countly", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(hasEnvVariables, "hasEnvVariables", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(countlyServer, "countlyServer", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(testCounty, "testCounty", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
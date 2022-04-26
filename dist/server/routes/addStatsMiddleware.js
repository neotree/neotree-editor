"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _countlySdkNodejs = _interopRequireDefault(require("countly-sdk-nodejs"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

_countlySdkNodejs["default"].init({
  app_key: process.env.COUNTLY_APP_KEY,
  url: process.env.COUNTLY_HOST,
  debug: true
});

var _default = function _default(req, res) {
  var stats = req.body.stats || []; // Countly.begin_session();

  stats.forEach(function (stat) {
    _countlySdkNodejs["default"].track_view(stat.data.screenTitle || stat.data.screenId); // Countly.add_event({
    //     key: stat.type,
    //     count: stat.count,
    //     // sum: 0,
    //     dur: stat.duration,
    //     segmentation: { ...stat.data }
    // });

  }); // Countly.end_session();

  res.json({
    success: true
  });
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/routes/addStatsMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
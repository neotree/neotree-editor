"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var CustomMiddleware = exports["default"] = /*#__PURE__*/function () {
  function CustomMiddleware() {
    (0, _classCallCheck2["default"])(this, CustomMiddleware);
    (0, _defineProperty2["default"])(this, "go", function (next) {
      return next();
    });
  }
  (0, _createClass2["default"])(CustomMiddleware, [{
    key: "use",
    value: function use(fn) {
      var _this = this;
      this.go = function (stack) {
        return function (next) {
          return stack(fn.bind(_this, next.bind(_this)));
        };
      }(this.go);
    }
  }, {
    key: "__reactstandin__regenerateByEval",
    value: // @ts-ignore
    function __reactstandin__regenerateByEval(key, code) {
      // @ts-ignore
      this[key] = eval(code);
    }
  }]);
  return CustomMiddleware;
}();
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(CustomMiddleware, "CustomMiddleware", "/Users/lafarai/WorkBench/BWS/neotree-editor/utils/CustomMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
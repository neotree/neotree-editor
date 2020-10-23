"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "sequelize", {
  enumerable: true,
  get: function get() {
    return _sequelize["default"];
  }
});
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function get() {
    return _User["default"];
  }
});
Object.defineProperty(exports, "File", {
  enumerable: true,
  get: function get() {
    return _File["default"];
  }
});
Object.defineProperty(exports, "Script", {
  enumerable: true,
  get: function get() {
    return _Script["default"];
  }
});
Object.defineProperty(exports, "Screen", {
  enumerable: true,
  get: function get() {
    return _Screen["default"];
  }
});
Object.defineProperty(exports, "Diagnosis", {
  enumerable: true,
  get: function get() {
    return _Diagnosis["default"];
  }
});
Object.defineProperty(exports, "ConfigKey", {
  enumerable: true,
  get: function get() {
    return _ConfigKey["default"];
  }
});
Object.defineProperty(exports, "ApiKey", {
  enumerable: true,
  get: function get() {
    return _ApiKey["default"];
  }
});
Object.defineProperty(exports, "Device", {
  enumerable: true,
  get: function get() {
    return _Device["default"];
  }
});
Object.defineProperty(exports, "Log", {
  enumerable: true,
  get: function get() {
    return _Log["default"];
  }
});
Object.defineProperty(exports, "Hospital", {
  enumerable: true,
  get: function get() {
    return _Hospital["default"];
  }
});
exports.init = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _sequelize = _interopRequireDefault(require("./sequelize"));

var _User = _interopRequireDefault(require("./_User"));

var _File = _interopRequireDefault(require("./_File"));

var _Script = _interopRequireDefault(require("./_Script"));

var _Screen = _interopRequireDefault(require("./_Screen"));

var _Diagnosis = _interopRequireDefault(require("./_Diagnosis"));

var _ConfigKey = _interopRequireDefault(require("./_ConfigKey"));

var _ApiKey = _interopRequireDefault(require("./_ApiKey"));

var _Device = _interopRequireDefault(require("./_Device"));

var _Log = _interopRequireDefault(require("./_Log"));

var _Hospital = _interopRequireDefault(require("./_Hospital"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var init = function init() {
  return new Promise(function (resolve, reject) {
    var errors = [];
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return _sequelize["default"].authenticate();

            case 3:
              _context.next = 8;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", reject(_context.t0));

            case 8:
              _context.prev = 8;
              _context.next = 11;
              return _Hospital["default"].sync();

            case 11:
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t1 = _context["catch"](8);
              errors.push(_context.t1);

            case 16:
              _context.prev = 16;
              _context.next = 19;
              return _User["default"].sync();

            case 19:
              _context.next = 24;
              break;

            case 21:
              _context.prev = 21;
              _context.t2 = _context["catch"](16);
              errors.push(_context.t2);

            case 24:
              _context.prev = 24;
              _context.next = 27;
              return _File["default"].sync();

            case 27:
              _context.next = 32;
              break;

            case 29:
              _context.prev = 29;
              _context.t3 = _context["catch"](24);
              errors.push(_context.t3);

            case 32:
              _context.prev = 32;
              _context.next = 35;
              return _Script["default"].sync();

            case 35:
              _context.next = 40;
              break;

            case 37:
              _context.prev = 37;
              _context.t4 = _context["catch"](32);
              errors.push(_context.t4);

            case 40:
              _context.prev = 40;
              _context.next = 43;
              return _Screen["default"].sync();

            case 43:
              _context.next = 48;
              break;

            case 45:
              _context.prev = 45;
              _context.t5 = _context["catch"](40);
              errors.push(_context.t5);

            case 48:
              _context.prev = 48;
              _context.next = 51;
              return _Diagnosis["default"].sync();

            case 51:
              _context.next = 56;
              break;

            case 53:
              _context.prev = 53;
              _context.t6 = _context["catch"](48);
              errors.push(_context.t6);

            case 56:
              _context.prev = 56;
              _context.next = 59;
              return _ConfigKey["default"].sync();

            case 59:
              _context.next = 64;
              break;

            case 61:
              _context.prev = 61;
              _context.t7 = _context["catch"](56);
              errors.push(_context.t7);

            case 64:
              _context.prev = 64;
              _context.next = 67;
              return _ApiKey["default"].sync();

            case 67:
              _context.next = 72;
              break;

            case 69:
              _context.prev = 69;
              _context.t8 = _context["catch"](64);
              errors.push(_context.t8);

            case 72:
              _context.prev = 72;
              _context.next = 75;
              return _Device["default"].sync();

            case 75:
              _context.next = 80;
              break;

            case 77:
              _context.prev = 77;
              _context.t9 = _context["catch"](72);
              errors.push(_context.t9);

            case 80:
              _context.prev = 80;
              _context.next = 83;
              return _Log["default"].sync();

            case 83:
              _context.next = 88;
              break;

            case 85:
              _context.prev = 85;
              _context.t10 = _context["catch"](80);
              errors.push(_context.t10);

            case 88:
              if (!errors.length) {
                resolve(_sequelize["default"]);
              } else {
                reject(new Error(errors.map(function (e) {
                  return e.message || e.msg || JSON.stringify(e);
                }).join('\n')));
              }

            case 89:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 5], [8, 13], [16, 21], [24, 29], [32, 37], [40, 45], [48, 53], [56, 61], [64, 69], [72, 77], [80, 85]]);
    }))();
  });
};

exports.init = init;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(init, "init", "/home/farai/WorkBench/neotree-editor/server/database/models/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
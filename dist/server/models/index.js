"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
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
Object.defineProperty(exports, "UserProfile", {
  enumerable: true,
  get: function get() {
    return _UserProfile["default"];
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
exports.dbInit = exports.sequelize = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _sequelize = _interopRequireDefault(require("./sequelize"));

var _User = _interopRequireDefault(require("./_User"));

var _File = _interopRequireDefault(require("./_File"));

var _UserProfile = _interopRequireDefault(require("./_UserProfile"));

var _Script = _interopRequireDefault(require("./_Script"));

var _Screen = _interopRequireDefault(require("./_Screen"));

var _Diagnosis = _interopRequireDefault(require("./_Diagnosis"));

var _ConfigKey = _interopRequireDefault(require("./_ConfigKey"));

var _ApiKey = _interopRequireDefault(require("./_ApiKey"));

var _Device = _interopRequireDefault(require("./_Device"));

var _Log = _interopRequireDefault(require("./_Log"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var sequelize = _sequelize["default"];
exports.sequelize = sequelize;

var dbInit = function dbInit() {
  return new Promise(function (resolve, reject) {
    var initUsersTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _User["default"].sync();

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
    var initFilesTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _File["default"].sync();

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
    var initUserProfilesTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _UserProfile["default"].sync();

            case 2:
              return _context3.abrupt("return", _context3.sent);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }))();
    var initScriptsTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _Script["default"].sync();

            case 2:
              return _context4.abrupt("return", _context4.sent);

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
    var initScreensTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _Screen["default"].sync();

            case 2:
              return _context5.abrupt("return", _context5.sent);

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
    var initDiagnosesTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _Diagnosis["default"].sync();

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }))();
    var initConfigKeysTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _ConfigKey["default"].sync();

            case 2:
              return _context7.abrupt("return", _context7.sent);

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }))();
    var initApiKeysTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _ApiKey["default"].sync();

            case 2:
              return _context8.abrupt("return", _context8.sent);

            case 3:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }))();
    var initDeviceTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _Device["default"].sync();

            case 2:
              return _context9.abrupt("return", _context9.sent);

            case 3:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }))();
    var initLogTable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _Log["default"].sync();

            case 2:
              return _context10.abrupt("return", _context10.sent);

            case 3:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    }))();

    _sequelize["default"].authenticate().then(function () {
      console.log('Connected to the database.'); // eslint-disable-line

      Promise.all([initUsersTable, initFilesTable, initUserProfilesTable, initScriptsTable, initScreensTable, initDiagnosesTable, initConfigKeysTable, initApiKeysTable, initDeviceTable, initLogTable]).then(function () {
        resolve(sequelize);

        _User["default"].count({}).then(function (count) {
          if (!count) _User["default"].create({
            email: 'ldt@bwsonline.co.za',
            role: 1
          });
        });
      })["catch"](function (err) {
        return reject(err);
      });
    })["catch"](function (err) {
      console.log('DATABASE INIT ERROR:', e); // eslint-disable-line

      reject(err);
      process.exit(1);
    });
  });
};

exports.dbInit = dbInit;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(sequelize, "sequelize", "/home/farai/WorkBench/neotree-editor/server/models/index.js");
  reactHotLoader.register(dbInit, "dbInit", "/home/farai/WorkBench/neotree-editor/server/models/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbInit = exports.ConfigKey = exports.Diagnosis = exports.Screen = exports.Script = exports.App = exports.UserProfile = exports.File = exports.User = exports.sequelize = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _User = _interopRequireDefault(require("./User"));

var _File = _interopRequireDefault(require("./File"));

var _App = _interopRequireDefault(require("./App"));

var _Profile = _interopRequireDefault(require("./User/Profile"));

var _Script = _interopRequireDefault(require("./Script"));

var _Screen = _interopRequireDefault(require("./Screen"));

var _Diagnosis = _interopRequireDefault(require("./Diagnosis"));

var _ConfigKey = _interopRequireDefault(require("./ConfigKey"));

var _firebase = _interopRequireDefault(require("../firebase"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var dbConfig = process.env.NODE_ENV === 'production' ? require('../../_config/config.production.json').database : require('../../_config/config.development.json').database;
var sequelize = new _sequelize["default"](process.env.DATABASE_NAME || dbConfig.database, process.env.DATABASE_USERNAME || dbConfig.username, process.env.DATABASE_PASSWORD || dbConfig.password, {
  host: dbConfig.host || 'localhost',
  dialect: 'postgres',
  logging: false
}); // export const Session = sequelize.define(
//   'Session',
//   SessionModel.getStructure({ Sequelize })
// );

exports.sequelize = sequelize;
var User = sequelize.define('user', _User["default"].getStructure({
  Sequelize: _sequelize["default"]
}));
exports.User = User;
Object.keys(_User["default"]).forEach(function (key) {
  return User[key] = _User["default"][key];
});
var File = sequelize.define('file', _File["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.File = File;
Object.keys(_File["default"]).forEach(function (key) {
  return File[key] = _File["default"][key];
});
var UserProfile = sequelize.define('user_profile', _Profile["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.UserProfile = UserProfile;
Object.keys(_Profile["default"]).forEach(function (key) {
  return UserProfile[key] = _Profile["default"][key];
});
User.Profile = UserProfile;
var App = sequelize.define('app', _App["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.App = App;
Object.keys(_App["default"]).forEach(function (key) {
  return App[key] = _App["default"][key];
});
var Script = sequelize.define('script', _Script["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.Script = Script;
Script.afterUpdate(function (script) {
  var _JSON$parse = JSON.parse(JSON.stringify(script)),
      id = _JSON$parse.id,
      data = _JSON$parse.data,
      createdAt = _JSON$parse.createdAt,
      scr = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("scripts/".concat(id)).update((0, _objectSpread2["default"])({}, data, {}, scr, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(script);
  });
});
Script.afterDestroy(function (instance) {
  _firebase["default"].database().ref("screens/".concat(instance.id)).remove();

  _firebase["default"].database().ref("diagnosis/".concat(instance.id)).remove();

  _firebase["default"].database().ref("scripts/".concat(instance.id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
Object.keys(_Script["default"]).forEach(function (key) {
  return Script[key] = _Script["default"][key];
});
var Screen = sequelize.define('screen', _Screen["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.Screen = Screen;
Screen.afterUpdate(function (script) {
  var _JSON$parse2 = JSON.parse(JSON.stringify(script)),
      id = _JSON$parse2.id,
      data = _JSON$parse2.data,
      createdAt = _JSON$parse2.createdAt,
      scr = (0, _objectWithoutProperties2["default"])(_JSON$parse2, ["id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("screens/".concat(script.script_id, "/").concat(id)).update((0, _objectSpread2["default"])({}, data, {}, scr, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(script);
  });
});
Screen.afterDestroy(function (instance) {
  _firebase["default"].database().ref("screens/".concat(instance.script_id, "/").concat(instance.id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
Object.keys(_Screen["default"]).forEach(function (key) {
  return Screen[key] = _Screen["default"][key];
});
var Diagnosis = sequelize.define('diagnosis', _Diagnosis["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.Diagnosis = Diagnosis;
Diagnosis.afterUpdate(function (diagnosis) {
  var _JSON$parse3 = JSON.parse(JSON.stringify(diagnosis)),
      id = _JSON$parse3.id,
      data = _JSON$parse3.data,
      createdAt = _JSON$parse3.createdAt,
      d = (0, _objectWithoutProperties2["default"])(_JSON$parse3, ["id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id, "/").concat(id)).update((0, _objectSpread2["default"])({}, data, {}, d, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(diagnosis);
  });
});
Diagnosis.afterDestroy(function (instance) {
  _firebase["default"].database().ref("diagnosis/".concat(instance.script_id, "/").concat(instance.id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
Object.keys(_Diagnosis["default"]).forEach(function (key) {
  return Diagnosis[key] = _Diagnosis["default"][key];
});
var ConfigKey = sequelize.define('config_key', _ConfigKey["default"].getStructure({
  User: User,
  Sequelize: _sequelize["default"]
}));
exports.ConfigKey = ConfigKey;
ConfigKey.afterUpdate(function (cKey) {
  var _JSON$parse4 = JSON.parse(JSON.stringify(cKey)),
      id = _JSON$parse4.id,
      data = _JSON$parse4.data,
      createdAt = _JSON$parse4.createdAt,
      c = (0, _objectWithoutProperties2["default"])(_JSON$parse4, ["id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("configkeys/".concat(id)).update((0, _objectSpread2["default"])({}, data, {}, c, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(cKey);
  });
});
ConfigKey.afterDestroy(function (instance) {
  _firebase["default"].database().ref("configkeys/".concat(instance.id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
Object.keys(_ConfigKey["default"]).forEach(function (key) {
  return ConfigKey[key] = _ConfigKey["default"][key];
});

var dbInit = function dbInit() {
  return new Promise(function (resolve, reject) {
    // const initSessionsTable = (async () => await Session.sync())();
    var initUsersTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return User.sync();

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
    var initFilesTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return File.sync();

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
    var initUserProfilesTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3() {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return UserProfile.sync();

            case 2:
              return _context3.abrupt("return", _context3.sent);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }))();
    var initAppTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return App.sync();

            case 2:
              return _context4.abrupt("return", _context4.sent);

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
    var initScriptsTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return Script.sync();

            case 2:
              return _context5.abrupt("return", _context5.sent);

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }))();
    var initScreensTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee6() {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return Screen.sync();

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }))();
    var initDiagnosesTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee7() {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return Diagnosis.sync();

            case 2:
              return _context7.abrupt("return", _context7.sent);

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }))();
    var initConfigKeysTable = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee8() {
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return ConfigKey.sync();

            case 2:
              return _context8.abrupt("return", _context8.sent);

            case 3:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }))();
    sequelize.authenticate().then(function () {
      console.log('Connected to the database.'); // eslint-disable-line

      Promise.all([// initSessionsTable,
      initUsersTable, initFilesTable, initUserProfilesTable, initAppTable, initScriptsTable, initScreensTable, initDiagnosesTable, initConfigKeysTable]).then(function (rslts) {
        return resolve(rslts);
      })["catch"](function (err) {
        return reject(err);
      });
    })["catch"](function (err) {
      reject(err);
    });
  });
};

exports.dbInit = dbInit;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(dbConfig, "dbConfig", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(sequelize, "sequelize", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(User, "User", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(File, "File", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(UserProfile, "UserProfile", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(App, "App", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(Script, "Script", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(Screen, "Screen", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(Diagnosis, "Diagnosis", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(ConfigKey, "ConfigKey", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
  reactHotLoader.register(dbInit, "dbInit", "/home/bws/WorkBench/neotree-editor/_server/models/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
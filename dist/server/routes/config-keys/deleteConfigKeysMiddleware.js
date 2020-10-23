"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteConfigKey = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var deleteConfigKey = function deleteConfigKey(_ref, deleteAssociatedData) {
  var id = _ref.configKeyId;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var configKey;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (id) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required configKey "id" is not provided.')));

            case 2:
              configKey = null;
              _context.prev = 3;
              _context.next = 6;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("configkeys/".concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 6:
              configKey = _context.sent;
              _context.next = 11;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);

            case 11:
              _context.prev = 11;
              _context.next = 14;
              return _firebase["default"].database().ref("configkeys/".concat(id)).remove();

            case 14:
              _context.next = 19;
              break;

            case 16:
              _context.prev = 16;
              _context.t1 = _context["catch"](11);
              return _context.abrupt("return", reject(_context.t1));

            case 19:
              if (!(deleteAssociatedData === false)) {
                _context.next = 21;
                break;
              }

              return _context.abrupt("return", resolve(configKey));

            case 21:
              _context.prev = 21;
              _context.next = 24;
              return _firebase["default"].database().ref("screens/".concat(id)).remove();

            case 24:
              _context.next = 28;
              break;

            case 26:
              _context.prev = 26;
              _context.t2 = _context["catch"](21);

            case 28:
              _context.prev = 28;
              _context.next = 31;
              return _firebase["default"].database().ref("diagnosis/".concat(id)).remove();

            case 31:
              _context.next = 35;
              break;

            case 33:
              _context.prev = 33;
              _context.t3 = _context["catch"](28);

            case 35:
              _context.prev = 35;
              _context.next = 38;
              return _models.ConfigKey.destroy({
                where: {
                  config_key_id: configKey.configKeyId
                }
              });

            case 38:
              _context.next = 42;
              break;

            case 40:
              _context.prev = 40;
              _context.t4 = _context["catch"](35);

            case 42:
              resolve(configKey);

            case 43:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9], [11, 16], [21, 26], [28, 33], [35, 40]]);
    }))();
  });
};

exports.deleteConfigKey = deleteConfigKey;

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _req$body, configKeys, deleteAssociatedData, done, rslts;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _req$body = req.body, configKeys = _req$body.configKeys, deleteAssociatedData = _req$body.deleteAssociatedData;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                if (rslts.length) {
                  app.io.emit('delete_config_keys', {
                    key: app.getRandomString(),
                    configKeys: configKeys
                  });

                  _models.Log.create({
                    name: 'delete_config_keys',
                    data: JSON.stringify({
                      configKeys: configKeys
                    })
                  });
                }

                res.locals.setResponse(err, {
                  configKeys: rslts
                });
                next();
              };

              rslts = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(configKeys.map(function (s) {
                return deleteConfigKey(s, deleteAssociatedData);
              }));

            case 6:
              rslts = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, rslts);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 9]]);
    }))();
  };
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(deleteConfigKey, "deleteConfigKey", "/home/farai/WorkBench/neotree-editor/server/routes/config-keys/deleteConfigKeysMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
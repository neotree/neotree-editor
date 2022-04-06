"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createScreen = createScreen;
exports.createScreenMiddleware = createScreenMiddleware;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _database = require("../../database");

var _excluded = ["scriptId"],
    _excluded2 = ["data"];

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

function createScreen() {
  return _createScreen.apply(this, arguments);
}

function _createScreen() {
  _createScreen = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var _payload,
        scriptId,
        payload,
        screenId,
        snap,
        screensCount,
        screen,
        rslts,
        _JSON$parse,
        data,
        s,
        _args2 = arguments;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _payload = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
            scriptId = _payload.scriptId, payload = (0, _objectWithoutProperties2["default"])(_payload, _excluded); // if (payload.type === 'diagnosis') {
            //   const countDiagnosisScreens = await Screen.count({ where: { type: 'diagnosis', script_id: scriptId } });
            //   if (countDiagnosisScreens) throw new Error('A script can only have one screen with type `diagnosis`');
            // }

            screenId = null;
            _context2.prev = 3;
            _context2.next = 6;
            return _firebase["default"].database().ref("screens/".concat(scriptId)).push();

          case 6:
            snap = _context2.sent;
            screenId = snap.key;
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](3);
            throw _context2.t0;

          case 13:
            screensCount = 0;
            _context2.prev = 14;
            _context2.next = 17;
            return _database.Screen.count({
              where: {
                script_id: scriptId,
                deletedAt: null
              }
            });

          case 17:
            screensCount = _context2.sent;
            _context2.next = 22;
            break;

          case 20:
            _context2.prev = 20;
            _context2.t1 = _context2["catch"](14);

          case 22:
            screen = _objectSpread(_objectSpread({}, payload), {}, {
              screenId: screenId,
              scriptId: scriptId,
              script_id: scriptId,
              screen_id: screenId,
              position: screensCount + 1,
              createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
              updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
            });
            _context2.prev = 23;
            _context2.next = 26;
            return _database.Screen.findOrCreate({
              where: {
                screen_id: screen.screenId
              },
              defaults: {
                script_id: scriptId,
                screen_id: screen.screenId,
                position: screen.position,
                type: screen.type,
                data: JSON.stringify(screen)
              }
            });

          case 26:
            rslts = _context2.sent;

            if (rslts && rslts[0]) {
              _JSON$parse = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded2);
              screen = _objectSpread(_objectSpread({}, data), s);
            }

            _context2.next = 33;
            break;

          case 30:
            _context2.prev = 30;
            _context2.t2 = _context2["catch"](23);
            throw _context2.t2;

          case 33:
            return _context2.abrupt("return", screen);

          case 34:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 10], [14, 20], [23, 30]]);
  }));
  return _createScreen.apply(this, arguments);
}

function createScreenMiddleware() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, screen;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              done = function done(err, screen) {
                res.locals.setResponse(err, {
                  screen: screen
                });
                next();
              };

              _context.prev = 1;
              _context.next = 4;
              return createScreen(req.body);

            case 4:
              screen = _context.sent;
              done(null, screen);
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", done(_context.t0));

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 8]]);
    }))();
  };
}

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(createScreen, "createScreen", "/home/farai/Workbench/neotree-editor/server/routes/screens/createScreenMiddleware.js");
  reactHotLoader.register(createScreenMiddleware, "createScreenMiddleware", "/home/farai/Workbench/neotree-editor/server/routes/screens/createScreenMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.deleteDiagnosis = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var deleteDiagnosis = function deleteDiagnosis(_ref) {
  var scriptId = _ref.scriptId,
      id = _ref.diagnosisId;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var diagnosis;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (scriptId) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required script "id" is not provided.')));

            case 2:
              if (id) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required diagnosis "id" is not provided.')));

            case 4:
              diagnosis = null;
              _context.prev = 5;
              _context.next = 8;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(scriptId, "/").concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 8:
              diagnosis = _context.sent;
              _context.next = 13;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](5);

            case 13:
              _context.prev = 13;
              _context.next = 16;
              return _firebase["default"].database().ref("diagnosis/".concat(scriptId, "/").concat(id)).remove();

            case 16:
              _context.next = 21;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](13);
              return _context.abrupt("return", reject(_context.t1));

            case 21:
              resolve(diagnosis);

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 11], [13, 18]]);
    }))();
  });
};

exports.deleteDiagnosis = deleteDiagnosis;

var _default = function _default(app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var diagnoses, done, rslts;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              diagnoses = req.body.diagnoses;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                if (rslts.length) app.io.emit('delete_diagnoses', {
                  key: app.getRandomString(),
                  diagnoses: diagnoses
                });
                res.locals.setResponse(err, {
                  diagnoses: rslts
                });
                next();
              };

              rslts = null;
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(diagnoses.map(function (s) {
                return deleteDiagnosis(s);
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

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(deleteDiagnosis, "deleteDiagnosis", "/home/farai/WorkBench/neotree-editor/server/routes/diagnoses/deleteDiagnosesMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/diagnoses/deleteDiagnosesMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
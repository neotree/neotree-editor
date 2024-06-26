"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = shouldBackup;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _sequelize = require("sequelize");
var database = _interopRequireWildcard(require("../../database"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
function shouldBackup() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var appInfo, whereLastUpdated, countScripts, countScreens, countDiagnoses, countConfigKeys, countHospitals, whereLastDeleted, countDeletedScripts, countDeletedScreens, countDeletedDiagnoses, countDeletedConfigKeys, countDeletedHospitals;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            appInfo = null;
            _context.next = 4;
            return database.App.findOne({
              where: {
                id: 1
              }
            });
          case 4:
            appInfo = _context.sent;
            appInfo = !appInfo ? null : JSON.parse(JSON.stringify(appInfo));
            if (appInfo) {
              _context.next = 8;
              break;
            }
            return _context.abrupt("return", resolve(true));
          case 8:
            whereLastUpdated = !appInfo.last_backup_date ? {} : {
              updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, appInfo.last_backup_date),
              deletedAt: null
            };
            _context.next = 11;
            return database.Script.count({
              where: whereLastUpdated
            });
          case 11:
            countScripts = _context.sent;
            _context.next = 14;
            return database.Screen.count({
              where: whereLastUpdated
            });
          case 14:
            countScreens = _context.sent;
            _context.next = 17;
            return database.Diagnosis.count({
              where: whereLastUpdated
            });
          case 17:
            countDiagnoses = _context.sent;
            _context.next = 20;
            return database.ConfigKey.count({
              where: whereLastUpdated
            });
          case 20:
            countConfigKeys = _context.sent;
            _context.next = 23;
            return database.Hospital.count({
              where: whereLastUpdated
            });
          case 23:
            countHospitals = _context.sent;
            whereLastDeleted = !appInfo.last_backup_date ? {} : {
              deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, appInfo.last_backup_date)
            };
            _context.next = 27;
            return database.Script.count({
              where: whereLastDeleted
            });
          case 27:
            countDeletedScripts = _context.sent;
            _context.next = 30;
            return database.Screen.count({
              where: whereLastDeleted
            });
          case 30:
            countDeletedScreens = _context.sent;
            _context.next = 33;
            return database.Diagnosis.count({
              where: whereLastDeleted
            });
          case 33:
            countDeletedDiagnoses = _context.sent;
            _context.next = 36;
            return database.ConfigKey.count({
              where: whereLastDeleted
            });
          case 36:
            countDeletedConfigKeys = _context.sent;
            _context.next = 39;
            return database.Hospital.count({
              where: whereLastDeleted
            });
          case 39:
            countDeletedHospitals = _context.sent;
            resolve(!!(countScripts || countScreens || countDiagnoses || countConfigKeys || countHospitals || countDeletedScripts || countDeletedScreens || countDeletedDiagnoses || countDeletedConfigKeys || countDeletedHospitals));
            _context.next = 46;
            break;
          case 43:
            _context.prev = 43;
            _context.t0 = _context["catch"](0);
            reject(_context.t0);
          case 46:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 43]]);
    }))();
  });
}
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(shouldBackup, "shouldBackup", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/utils/backup/shouldBackup.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
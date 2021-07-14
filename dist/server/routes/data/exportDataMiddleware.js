"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res) {
    var _req$query = req.query,
        script = _req$query.script,
        configKey = _req$query.configKey,
        allScripts = _req$query.allScripts,
        allConfigKeys = _req$query.allConfigKeys;

    var done = function done(error) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var name = 'neotree';
      if (configKey) name = "".concat(name, "-config_key-").concat(configKey);
      if (script) name = "".concat(name, "-script-").concat(script);
      name = "".concat(name, ".json");

      var dest = _path["default"].resolve(__dirname, "../../tmp_uploads/".concat(name));

      _fs["default"].writeFile(dest, JSON.stringify(data), function (error) {
        // write-file
        if (error) return res.json({
          error: error
        });
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': "attachment; filename=".concat(name)
        });

        var stream = _fs["default"].createReadStream(dest);

        stream.on('end', function () {
          return _fs["default"].unlink(dest, function () {
            /**/
          });
        });
        stream.pipe(res);
      });

      return null;
    };

    if (script || configKey) {
      return Promise.all([configKey ? _database.ConfigKey.findOne({
        where: {
          id: configKey
        }
      }) : null, script ? _database.Script.findOne({
        where: {
          id: script
        }
      }) : null, script ? _database.Screen.findAll({
        where: {
          script_id: script
        }
      }) : null, script ? _database.Diagnosis.findAll({
        where: {
          script_id: script
        }
      }) : null]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
            configKey = _ref2[0],
            script = _ref2[1],
            screens = _ref2[2],
            diagnoses = _ref2[3];

        var data = {};
        if (configKey) data.configKeys = [configKey];

        if (script) {
          script = script.toJSON();
          script.screens = screens || [];
          script.diagnoses = diagnoses || [];
          data.scripts = [script];
        }

        return done(null, data);
      })["catch"](done);
    }

    if (allScripts || allConfigKeys) {
      Promise.all([allConfigKeys ? _database.ConfigKey.findAll({}) : null, allScripts ? _database.Script.findAll({}) : null, allScripts ? _database.Screen.findAll({}) : null, allScripts ? _database.Diagnosis.findAll({}) : null]).then(function (rslts) {
        var _rslts = (0, _slicedToArray2["default"])(rslts, 4),
            configKeys = _rslts[0],
            scripts = _rslts[1],
            screens = _rslts[2],
            diagnoses = _rslts[3];

        var data = {};

        if (configKeys) {
          data.configKeys = configKeys.map(function (k) {
            return k.toJSON();
          });
        }

        if (scripts) {
          data.scripts = scripts.map(function (script) {
            script = script.toJSON();
            return _objectSpread(_objectSpread({}, script), {}, {
              screens: screens.filter(function (scr) {
                return scr.script_id === script.id;
              }).map(function (scr) {
                return scr.toJSON();
              }),
              diagnoses: diagnoses.filter(function (d) {
                return d.script_id === script.id;
              }).map(function (scr) {
                return scr.toJSON();
              })
            });
          });
        }

        return done(null, data);
      })["catch"](done);
    }
  };
};
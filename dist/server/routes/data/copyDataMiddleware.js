"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _http = _interopRequireDefault(require("http"));

var _database = require("../../database");

var _updateScreensMiddleware = require("../../routes/screens/updateScreensMiddleware");

var _splitCamelCase = _interopRequireDefault(require("../../../utils/splitCamelCase"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var callRemote = function callRemote(req, url) {
  return new Promise(function (resolve, reject) {
    var source = req.body.source;

    _http["default"].get(url, function (response) {
      var data = '';
      response.on('data', function (chunk) {
        return data += chunk;
      });
      response.on('end', function () {
        if (data) {
          try {
            data = JSON.parse(data);
            return data.error ? reject(data.error) : resolve(data);
          } catch (e) {
            reject(e);
          }
        }

        reject({
          msg: "Something went wrong fetching the original ".concat(source.dataType, ".")
        });
      });
    }).on('error', reject);
  });
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        source = _req$body.source,
        destination = _req$body.destination;

    var copy = function copy(source, destination) {
      return new Promise(function (resolve) {
        var done = function done(error, data) {
          resolve({
            error: error,
            data: data
          });
          return null;
        };

        var getSourcePayload = JSON.stringify({
          id: source.dataId
        });
        var getSourceURL = "".concat(source.host, "/get-full-").concat((0, _splitCamelCase["default"])(source.dataType, '-'), "?payload=").concat(getSourcePayload);
        callRemote(req, getSourceURL).then(function (data) {
          if (data.error) return done(data.error);
          var dataToImport = data.payload[source.dataType];
          var author = req.user ? req.user.id : null;

          var persitScriptItems = function persitScriptItems(Model, _ref) {
            var data = _ref.data,
                params = (0, _objectWithoutProperties2["default"])(_ref, ["data"]);
            return new Promise(function (resolve, reject) {
              var done = function done(err, item) {
                if (err) {
                  reject(err);
                } else {
                  resolve(item);
                }

                return null;
              };

              Model.create(_objectSpread(_objectSpread({}, data), {}, {
                data: JSON.stringify(data.data || {}),
                author: author
              }, params)).then(function (s) {
                return done(null, s);
              })["catch"](done);
              return null;
            });
          };

          switch (source.dataType) {
            case 'configKey':
              return _database.ConfigKey.create(_objectSpread(_objectSpread({}, dataToImport), {}, {
                data: JSON.stringify(dataToImport.data || {}),
                author: author
              })).then(function (s) {
                return done(null, s);
              })["catch"](done);

            case 'screen':
              return persitScriptItems(_database.Screen, {
                data: _objectSpread(_objectSpread({}, dataToImport), {}, {
                  position: 1,
                  script_id: destination.dataId
                })
              }).then(function (item) {
                (0, _updateScreensMiddleware.findAndUpdateScreens)({
                  attributes: ['id'],
                  where: {
                    script_id: item.script_id
                  },
                  order: [['position', 'ASC']]
                }, function (screens) {
                  return screens.map(function (scr, i) {
                    return _objectSpread(_objectSpread({}, scr), {}, {
                      position: i + 1
                    });
                  });
                }).then(function () {
                  return null;
                })["catch"](function () {
                  return null;
                });
                return done(null, item);
              })["catch"](done);

            case 'diagnosis':
              return persitScriptItems(_database.Diagnosis, {
                data: _objectSpread(_objectSpread({}, dataToImport), {}, {
                  position: 1,
                  script_id: destination.dataId
                })
              }).then(function (item) {
                return done(null, item);
              })["catch"](done);

            case 'script':
              return _database.Script.create(_objectSpread(_objectSpread({}, dataToImport), {}, {
                data: JSON.stringify(dataToImport.data || {}),
                author: author
              })).then(function (s) {
                callRemote(req, "".concat(source.host, "/get-script-items?payload=").concat(JSON.stringify({
                  script_id: source.dataId
                }))).then(function (_ref2) {
                  var payload = _ref2.payload;
                  var promises = [].concat((0, _toConsumableArray2["default"])(payload.screens.map(function (screen, position) {
                    return persitScriptItems(_database.Screen, {
                      position: position,
                      data: _objectSpread(_objectSpread({}, screen), {}, {
                        script_id: s.id
                      })
                    });
                  })), (0, _toConsumableArray2["default"])(payload.diagnoses.map(function (d, position) {
                    return persitScriptItems(_database.Diagnosis, {
                      position: position,
                      data: _objectSpread(_objectSpread({}, d), {}, {
                        script_id: s.id
                      })
                    });
                  })));
                  Promise.all(promises).then(function () {
                    return done(null, s);
                  })["catch"](function () {
                    return done(null, s);
                  });
                })["catch"](function () {
                  return done(null, s);
                });
              })["catch"](done);

            default:
              done({
                msg: 'Data could not be processed.'
              });
          }

          return done(null, (0, _defineProperty2["default"])({}, source.dataType, dataToImport));
        })["catch"](done);
      });
    };

    var ids = source.ids,
        s = (0, _objectWithoutProperties2["default"])(source, ["ids"]);
    Promise.all(ids.map(function (dataId) {
      return copy(_objectSpread(_objectSpread({}, s), {}, {
        dataId: dataId
      }), destination);
    })).then(function (rslts) {
      var payload = [];
      var errors = [];
      rslts.forEach(function (_ref3) {
        var error = _ref3.error,
            data = _ref3.data;

        if (error) {
          errors.push(error);
        } else {
          payload.push(data);
        }
      });
      res.locals.setResponse(errors.length ? errors : null, payload);
      next();
    });
  };
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(callRemote, "callRemote", "/home/farai/WorkBench/neotree-editor/server/routes/data/copyDataMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
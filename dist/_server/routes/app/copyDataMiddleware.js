"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _http = _interopRequireDefault(require("http"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

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

    var done = function done(err) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      res.locals.setResponse(err, (0, _defineProperty2["default"])({}, source.dataType, data));
      next();
      return null;
    };

    var getSourcePayload = JSON.stringify({
      id: source.dataId
    });
    var getSourceURL = "".concat(source.host, "/get-full-").concat(source.dataTypeHyphenated || source.dataType, "?payload=").concat(getSourcePayload);
    callRemote(req, getSourceURL).then(function (data) {
      if (data.error) return done(data.error);
      var dataToImport = data.payload[source.dataType];
      var author = req.user ? req.user.id : null;
      var id = (0, _uuidv["default"])();

      var persitScriptItems = function persitScriptItems(Model, _ref) {
        var data = _ref.data,
            isSingle = _ref.isSingle,
            params = (0, _objectWithoutProperties2["default"])(_ref, ["data", "isSingle"]);
        return new Promise(function (resolve, reject) {
          var done = function done(err, item) {
            if (err) {
              reject(err);
            } else {
              resolve(item);
            }

            return null;
          };

          var persist = function persist(otherParams) {
            return Model.create((0, _objectSpread2["default"])({}, data, {
              data: JSON.stringify(data.data || {}),
              details: JSON.stringify((0, _objectSpread2["default"])({}, data.details || {}, {
                originalHost: source.host,
                originalId: data.id
              })),
              id: id,
              author: author
            }, params, {}, otherParams)).then(function (s) {
              return done(null, s);
            })["catch"](done);
          };

          if (isSingle === false) return persist();
          Model.count({
            where: {
              script_id: destination.dataId
            }
          }).then(function (position) {
            return persist({
              position: position,
              script_id: destination.dataId
            });
          })["catch"](done);
          return null;
        });
      };

      switch (source.dataType) {
        case 'configKey':
          return _models.ConfigKey.create((0, _objectSpread2["default"])({}, dataToImport, {
            data: JSON.stringify(dataToImport.data || {}),
            details: JSON.stringify((0, _objectSpread2["default"])({}, dataToImport.details || {}, {
              originalHost: source.host
            })),
            id: id,
            author: author
          })).then(function (s) {
            return done(null, s);
          })["catch"](done);

        case 'screen':
          return persitScriptItems(_models.Screen, {
            data: dataToImport
          }).then(function (item) {
            return done(null, item);
          })["catch"](done);

        case 'diagnosis':
          return persitScriptItems(_models.Diagnosis, {
            data: dataToImport
          }).then(function (item) {
            return done(null, item);
          })["catch"](done);

        case 'script':
          return _models.Script.create((0, _objectSpread2["default"])({}, dataToImport, {
            data: JSON.stringify(dataToImport.data || {}),
            details: JSON.stringify((0, _objectSpread2["default"])({}, dataToImport.details || {}, {
              originalHost: source.host
            })),
            id: id,
            author: author
          })).then(function (s) {
            callRemote(req, "".concat(source.host, "/get-script-items?payload=").concat(JSON.stringify({
              script_id: source.dataId
            }))).then(function (_ref2) {
              var payload = _ref2.payload;
              var promises = [].concat((0, _toConsumableArray2["default"])(payload.screens.map(function (screen, position) {
                return persitScriptItems(_models.Screen, {
                  position: position,
                  id: (0, _uuidv["default"])(),
                  data: (0, _objectSpread2["default"])({}, screen, {
                    script_id: s.id
                  }),
                  isSingle: false
                });
              })), (0, _toConsumableArray2["default"])(payload.diagnoses.map(function (d, position) {
                return persitScriptItems(_models.Diagnosis, {
                  position: position,
                  id: (0, _uuidv["default"])(),
                  data: (0, _objectSpread2["default"])({}, d, {
                    script_id: s.id
                  }),
                  isSingle: false
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
  };
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(callRemote, "callRemote", "/home/bws/WorkBench/neotree-editor/_server/routes/app/copyDataMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
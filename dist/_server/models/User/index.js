"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _encryptPassword = _interopRequireDefault(require("../encryptPassword"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = {
  getStructure: function getStructure(_ref) {
    var Sequelize = _ref.Sequelize;
    return {
      id: {
        type: Sequelize.UUID,
        defaultValue: function defaultValue() {
          return (0, _uuidv["default"])();
        },
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING
      }
    };
  },
  add: function add(_ref2) {
    var _this = this;

    var id = _ref2.id,
        username = _ref2.username,
        password = _ref2.password;
    var Profile = this.Profile;
    var emailSplit = username.split('@');
    var profile_name = "".concat(emailSplit[0]).toLowerCase();
    return new Promise(function (resolve, reject) {
      Promise.all([_this.count({
        where: {
          email: username
        }
      }), Profile ? Profile.count({
        where: {
          profile_name: profile_name
        }
      }) : null]).then(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
            countUsersWithEmail = _ref4[0],
            countProfilesWithProfileName = _ref4[1];

        if (!id && countUsersWithEmail) return reject({
          msg: 'Username is taken.'
        }); //2. encrypt password

        (0, _encryptPassword["default"])(password, function (err, encryptedPassword) {
          if (err) return reject(err);
          var userId = id || (0, _uuidv["default"])();
          var profileId = (0, _uuidv["default"])();
          profile_name = countProfilesWithProfileName ? "".concat(profile_name, "-").concat(profileId) : profile_name;
          var promise = id ? new Promise(function (resolve, reject) {
            _this.update({
              password: encryptedPassword
            }, {
              where: {
                id: id
              },
              individualHooks: true
            }).then(function () {
              return _this.findOne({
                where: {
                  id: id
                }
              }).then(resolve)["catch"](reject);
            })["catch"](reject);
          }) : _this.create({
            id: userId,
            email: username,
            password: encryptedPassword
          });
          promise.then(function (user) {
            // resolve user if no Profile model is supplied
            // add user profile
            if (Profile) {
              return Profile.create({
                id: profileId,
                email: username,
                user_id: userId,
                profile_name: profile_name
              }).then(function (profile) {
                resolve({
                  user: user,
                  profile: profile
                });
              })["catch"](function (err) {
                return reject(err);
              });
            }

            resolve({
              user: user
            });
          })["catch"](function (err) {
            return reject(err);
          });
        });
      })["catch"](function (err) {
        return reject(err);
      });
    });
  }
};
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/models/User/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
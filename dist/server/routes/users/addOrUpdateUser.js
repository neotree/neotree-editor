"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = addUser;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _database = require("../../database");

var encryptPassword = function encryptPassword(password, callback) {
  return _bcryptjs["default"].genSalt(10, function (err, salt) {
    _bcryptjs["default"].hash(password, salt, function (err, hash) {
      if (err) return callback(err);
      callback(null, hash);
    });
  });
};

function addUser(_ref) {
  var role = _ref.role,
      id = _ref.id,
      username = _ref.username,
      password = _ref.password;
  var emailSplit = username.split('@');
  var profile_name = "".concat(emailSplit[0]).toLowerCase();
  return new Promise(function (resolve, reject) {
    Promise.all([_database.User.count({
      where: {
        email: username
      }
    }), _database.UserProfile.count({
      where: {
        profile_name: profile_name
      }
    })]).then(function (_ref2) {
      var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
          countUsersWithEmail = _ref3[0],
          countProfilesWithProfileName = _ref3[1];

      if (!id && countUsersWithEmail) return reject({
        msg: 'Username is taken.'
      }); //2. encrypt password

      encryptPassword(password, function (err, encryptedPassword) {
        if (err) return reject(err);
        var userId = id || (0, _uuidv["default"])();
        var profileId = (0, _uuidv["default"])();
        profile_name = countProfilesWithProfileName ? "".concat(profile_name, "-").concat(profileId) : profile_name;
        var promise = id ? new Promise(function (resolve, reject) {
          _database.User.update({
            password: encryptedPassword
          }, {
            where: {
              id: id
            },
            individualHooks: true
          }).then(function () {
            return _database.User.findOne({
              where: {
                id: id
              }
            }).then(resolve)["catch"](reject);
          })["catch"](reject);
        }) : _database.User.create({
          id: userId,
          role: role || 0,
          email: username,
          password: encryptedPassword
        });
        promise.then(function (user) {
          // resolve user if no Profile model is supplied
          return _database.UserProfile.create({
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
        })["catch"](function (err) {
          return reject(err);
        });
      });
    })["catch"](function (err) {
      return reject(err);
    });
  });
}
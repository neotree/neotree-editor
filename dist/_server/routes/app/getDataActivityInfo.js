"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || '{}');

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    Promise.all([_models.Script.count({
      where: (0, _objectSpread2["default"])({}, payload)
    }), _models.Script.findAll({
      where: (0, _objectSpread2["default"])({}, payload),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.Script.findAll({
      where: (0, _objectSpread2["default"])({}, payload),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    }), _models.Screen.count({
      where: (0, _objectSpread2["default"])({}, payload)
    }), _models.Screen.findAll({
      where: (0, _objectSpread2["default"])({}, payload),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.Screen.findAll({
      where: (0, _objectSpread2["default"])({}, payload),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    })]).then(function () {
      var rslts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      done(null, {
        scripts: {
          count: rslts[0],
          lastCreatedDate: rslts[1] && rslts[1][0] ? rslts[1][0].createdAt : null,
          lastUpdatedDate: rslts[2] && rslts[2][0] ? rslts[2][0].updatedAt : null
        },
        screens: {
          count: rslts[3],
          lastCreatedDate: rslts[4] && rslts[4][0] ? rslts[4][0].createdAt : null,
          lastUpdatedDate: rslts[5] && rslts[5][0] ? rslts[5][0].updatedAt : null
        }
      });
    })["catch"](done);
  };
};
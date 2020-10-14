"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _import = _interopRequireDefault(require("../../database/firebase/import"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/data"));

var router = _express["default"].Router();

module.exports = function (app) {
  router.post(endpoints.IMPORT_FIREBASE, function (req, res, next) {
    var done = function done(err, data) {
      res.locals.setResponse(err, data);
      next();
    };

    (0, _import["default"])().then(function () {
      return done(null, {
        success: true
      });
    })["catch"](done);
  }, require('../../utils/responseMiddleware'));
  router.get(endpoints.EXPORT_DATA, require('./exportDataMiddleware')(app));
  router.post(endpoints.COPY_DATA, require('./copyDataMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.EXPORT_TO_FIREBASE, require('./exportToFirebaseMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.SYNC_DATA, require('./syncData')(app), require('../../utils/responseMiddleware'));
  return router;
};
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _multer = _interopRequireDefault(require("multer"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _database = require("../../database");

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/files"));

var storage = _multer["default"].memoryStorage();

var upload = (0, _multer["default"])({
  storage: storage
});

module.exports = function (router) {
  router.post(endpoints.UPLOAD_FILE, upload.single('file'), function (req, res, next) {
    var f = req.file;
    var fileId = (0, _uuidv["default"])();

    var done = function done(err, file) {
      res.locals.setResponse(err, {
        file: file
      });
      next();
      return null;
    };

    _database.File.create({
      id: fileId,
      filename: f.originalname,
      content_type: f.mimetype,
      size: f.size,
      data: f.buffer,
      uploaded_by: req.user ? req.user.id : null
    }).then(function () {
      _database.File.findOne({
        where: {
          id: fileId
        },
        attributes: ['id', 'filename', 'content_type', 'size', 'createdAt', 'updatedAt']
      }).then(function (f) {
        return done(null, f);
      })["catch"](done);
    })["catch"](done);
  }, require('../../utils/responseMiddleware'));
  return router;
};
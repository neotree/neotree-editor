"use strict";

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (req, res) {
  var json = res.locals.getResponse();
  if (json.errors) {
    console.log('ERRORS', json.errors);
    json.errors = json.errors.map(function (e) {
      return e.msg || e.message || e;
    });
  }
  if (json.warnings) {
    console.log('WARNINGS', json.errors);
    json.errors = json.warnings.map(function (e) {
      return e.msg || e.message || e;
    });
  }
  res.json(json);
};
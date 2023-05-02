"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_COUNTRY = exports.UPDATE_COUNTRIES = exports.GET_COUNTRY = exports.GET_COUNTRIES = exports.DELETE_COUNTRY = exports.ADD_COUNTRY = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var GET_COUNTRIES = '/get-countries';
exports.GET_COUNTRIES = GET_COUNTRIES;
var GET_COUNTRY = '/get-country';
exports.GET_COUNTRY = GET_COUNTRY;
var ADD_COUNTRY = '/add-country';
exports.ADD_COUNTRY = ADD_COUNTRY;
var UPDATE_COUNTRY = '/update-country';
exports.UPDATE_COUNTRY = UPDATE_COUNTRY;
var UPDATE_COUNTRIES = '/update-countries';
exports.UPDATE_COUNTRIES = UPDATE_COUNTRIES;
var DELETE_COUNTRY = '/delete-country';
exports.DELETE_COUNTRY = DELETE_COUNTRY;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_COUNTRIES, "GET_COUNTRIES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(GET_COUNTRY, "GET_COUNTRY", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(ADD_COUNTRY, "ADD_COUNTRY", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(UPDATE_COUNTRY, "UPDATE_COUNTRY", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(UPDATE_COUNTRIES, "UPDATE_COUNTRIES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(DELETE_COUNTRY, "DELETE_COUNTRY", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/countries.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
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
var GET_COUNTRIES = exports.GET_COUNTRIES = '/get-countries';
var GET_COUNTRY = exports.GET_COUNTRY = '/get-country';
var ADD_COUNTRY = exports.ADD_COUNTRY = '/add-country';
var UPDATE_COUNTRY = exports.UPDATE_COUNTRY = '/update-country';
var UPDATE_COUNTRIES = exports.UPDATE_COUNTRIES = '/update-countries';
var DELETE_COUNTRY = exports.DELETE_COUNTRY = '/delete-country';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_COUNTRIES, "GET_COUNTRIES", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(GET_COUNTRY, "GET_COUNTRY", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(ADD_COUNTRY, "ADD_COUNTRY", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(UPDATE_COUNTRY, "UPDATE_COUNTRY", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(UPDATE_COUNTRIES, "UPDATE_COUNTRIES", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
  reactHotLoader.register(DELETE_COUNTRY, "DELETE_COUNTRY", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/countries.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();
"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/files/get-image-size/route";
exports.ids = ["app/api/files/get-image-size/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:https");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffiles%2Fget-image-size%2Froute&page=%2Fapi%2Ffiles%2Fget-image-size%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffiles%2Fget-image-size%2Froute.ts&appDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffiles%2Fget-image-size%2Froute&page=%2Fapi%2Ffiles%2Fget-image-size%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffiles%2Fget-image-size%2Froute.ts&appDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_farai_Workbench_Neotree_neotree_editor_app_api_files_get_image_size_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/files/get-image-size/route.ts */ \"(rsc)/./app/api/files/get-image-size/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/files/get-image-size/route\",\n        pathname: \"/api/files/get-image-size\",\n        filename: \"route\",\n        bundlePath: \"app/api/files/get-image-size/route\"\n    },\n    resolvedPagePath: \"/home/farai/Workbench/Neotree/neotree-editor/app/api/files/get-image-size/route.ts\",\n    nextConfigOutput,\n    userland: _home_farai_Workbench_Neotree_neotree_editor_app_api_files_get_image_size_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/files/get-image-size/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZmaWxlcyUyRmdldC1pbWFnZS1zaXplJTJGcm91dGUmcGFnZT0lMkZhcGklMkZmaWxlcyUyRmdldC1pbWFnZS1zaXplJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGZmlsZXMlMkZnZXQtaW1hZ2Utc2l6ZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGZmFyYWklMkZXb3JrYmVuY2glMkZOZW90cmVlJTJGbmVvdHJlZS1lZGl0b3IlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRmhvbWUlMkZmYXJhaSUyRldvcmtiZW5jaCUyRk5lb3RyZWUlMkZuZW90cmVlLWVkaXRvciZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDa0M7QUFDL0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZW90cmVlLXdlYmVkaXRvci8/NWNjMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9mYXJhaS9Xb3JrYmVuY2gvTmVvdHJlZS9uZW90cmVlLWVkaXRvci9hcHAvYXBpL2ZpbGVzL2dldC1pbWFnZS1zaXplL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9maWxlcy9nZXQtaW1hZ2Utc2l6ZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2ZpbGVzL2dldC1pbWFnZS1zaXplXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9maWxlcy9nZXQtaW1hZ2Utc2l6ZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9ob21lL2ZhcmFpL1dvcmtiZW5jaC9OZW90cmVlL25lb3RyZWUtZWRpdG9yL2FwcC9hcGkvZmlsZXMvZ2V0LWltYWdlLXNpemUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2ZpbGVzL2dldC1pbWFnZS1zaXplL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffiles%2Fget-image-size%2Froute&page=%2Fapi%2Ffiles%2Fget-image-size%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffiles%2Fget-image-size%2Froute.ts&appDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/files/get-image-size/route.ts":
/*!***********************************************!*\
  !*** ./app/api/files/get-image-size/route.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/logger */ \"(rsc)/./lib/logger.ts\");\n/* harmony import */ var _lib_image_size__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/image-size */ \"(rsc)/./lib/image-size.ts\");\n\n\n\nasync function POST(req) {\n    try {\n        // const isAuthorised = await isAuthenticated();\n        // if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });\n        const { imageURL } = await req.json();\n        const data = await (0,_lib_image_size__WEBPACK_IMPORTED_MODULE_2__.getRemoteImageSize)(imageURL);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            data\n        });\n    } catch (e) {\n        _lib_logger__WEBPACK_IMPORTED_MODULE_1__[\"default\"].log(\"/api/files/get-image-size\", e);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            errors: [\n                e.message\n            ]\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2ZpbGVzL2dldC1pbWFnZS1zaXplL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBd0Q7QUFHdEI7QUFDb0I7QUFFL0MsZUFBZUcsS0FBS0MsR0FBZ0I7SUFDdkMsSUFBSTtRQUNBLGdEQUFnRDtRQUVoRCxvR0FBb0c7UUFFcEcsTUFBTSxFQUFFQyxRQUFRLEVBQUUsR0FBRyxNQUFNRCxJQUFJRSxJQUFJO1FBRW5DLE1BQU1DLE9BQU8sTUFBTUwsbUVBQWtCQSxDQUFDRztRQUV0QyxPQUFPTCxxREFBWUEsQ0FBQ00sSUFBSSxDQUFDO1lBQUVDO1FBQUs7SUFDcEMsRUFBRSxPQUFNQyxHQUFRO1FBQ1pQLG1EQUFNQSxDQUFDUSxHQUFHLENBQUMsNkJBQTZCRDtRQUN4QyxPQUFPUixxREFBWUEsQ0FBQ00sSUFBSSxDQUFDO1lBQUVJLFFBQVE7Z0JBQUNGLEVBQUVHLE9BQU87YUFBQztRQUFFO0lBQ3BEO0FBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZW90cmVlLXdlYmVkaXRvci8uL2FwcC9hcGkvZmlsZXMvZ2V0LWltYWdlLXNpemUvcm91dGUudHM/ZWEwZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSBcIm5leHQvc2VydmVyXCI7XG5cbmltcG9ydCB7IGlzQXV0aGVudGljYXRlZCB9IGZyb20gXCJAL2FwcC9hY3Rpb25zL2lzLWF1dGhlbnRpY2F0ZWRcIjtcbmltcG9ydCBsb2dnZXIgZnJvbSBcIkAvbGliL2xvZ2dlclwiO1xuaW1wb3J0IHsgZ2V0UmVtb3RlSW1hZ2VTaXplIH0gZnJvbSBcIkAvbGliL2ltYWdlLXNpemVcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBOZXh0UmVxdWVzdCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIGNvbnN0IGlzQXV0aG9yaXNlZCA9IGF3YWl0IGlzQXV0aGVudGljYXRlZCgpO1xuXG4gICAgICAgIC8vIGlmICghaXNBdXRob3Jpc2VkLnllcykgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3JzOiBbJ1VuYXV0aG9yaXNlZCddLCB9LCB7IHN0YXR1czogMjAwLCB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICBjb25zdCB7IGltYWdlVVJMIH0gPSBhd2FpdCByZXEuanNvbigpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldFJlbW90ZUltYWdlU2l6ZShpbWFnZVVSTCk7XG5cbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZGF0YSB9KTtcbiAgICB9IGNhdGNoKGU6IGFueSkge1xuICAgICAgICBsb2dnZXIubG9nKCcvYXBpL2ZpbGVzL2dldC1pbWFnZS1zaXplJywgZSk7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yczogW2UubWVzc2FnZV0sIH0pO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJsb2dnZXIiLCJnZXRSZW1vdGVJbWFnZVNpemUiLCJQT1NUIiwicmVxIiwiaW1hZ2VVUkwiLCJqc29uIiwiZGF0YSIsImUiLCJsb2ciLCJlcnJvcnMiLCJtZXNzYWdlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/files/get-image-size/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/image-size.ts":
/*!***************************!*\
  !*** ./lib/image-size.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getRemoteImageSize: () => (/* binding */ getRemoteImageSize)\n/* harmony export */ });\n/* harmony import */ var node_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:http */ \"node:http\");\n/* harmony import */ var node_http__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_http__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var node_https__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:https */ \"node:https\");\n/* harmony import */ var node_https__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_https__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var image_size__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! image-size */ \"(rsc)/./node_modules/image-size/dist/index.js\");\n/* harmony import */ var image_size__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(image_size__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function getRemoteImageSize(url) {\n    try {\n        const chunks = [];\n        const res = await new Promise((resolve, reject)=>{\n            const _http = `${url || \"\"}`.substring(0, 5) === \"https\" ? (node_https__WEBPACK_IMPORTED_MODULE_1___default()) : (node_http__WEBPACK_IMPORTED_MODULE_0___default());\n            _http.get(new URL(url), function(response) {\n                response.on(\"data\", function(chunk) {\n                    chunks.push(chunk);\n                }).on(\"end\", function() {\n                    const buffer = Buffer.concat(chunks);\n                    try {\n                        // @ts-ignore\n                        const res = image_size__WEBPACK_IMPORTED_MODULE_2___default()(buffer, function(e) {\n                            if (e) reject(e);\n                        });\n                        // @ts-ignore\n                        resolve(res);\n                    } catch (e) {\n                        reject(e);\n                    }\n                }).on(\"error\", function(e) {\n                    reject(e);\n                });\n            });\n        });\n        return res;\n    } catch (e) {\n        throw e;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvaW1hZ2Utc2l6ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQTZCO0FBQ0U7QUFDQztBQUV6QixlQUFlRyxtQkFBbUJDLEdBQVc7SUFDaEQsSUFBSTtRQUNBLE1BQU1DLFNBQWdCLEVBQUU7UUFFeEIsTUFBTUMsTUFBTSxNQUFNLElBQUlDLFFBQTRDLENBQUNDLFNBQVNDO1lBQ3hFLE1BQU1DLFFBQVEsQ0FBQyxFQUFFTixPQUFPLEdBQUcsQ0FBQyxDQUFDTyxTQUFTLENBQUMsR0FBRyxPQUFPLFVBQVVWLG1EQUFLQSxHQUFHRCxrREFBSUE7WUFDdkVVLE1BQU1FLEdBQUcsQ0FBQyxJQUFJQyxJQUFJVCxNQUFNLFNBQVVVLFFBQVE7Z0JBRXRDQSxTQUFTQyxFQUFFLENBQUMsUUFBUSxTQUFVQyxLQUFLO29CQUMvQlgsT0FBT1ksSUFBSSxDQUFDRDtnQkFDaEIsR0FDQ0QsRUFBRSxDQUFDLE9BQU87b0JBQ1AsTUFBTUcsU0FBU0MsT0FBT0MsTUFBTSxDQUFDZjtvQkFDN0IsSUFBSTt3QkFDQSxhQUFhO3dCQUNiLE1BQU1DLE1BQU1KLGlEQUFNQSxDQUFDZ0IsUUFBUSxTQUFTRyxDQUFDOzRCQUNqQyxJQUFJQSxHQUFHWixPQUFPWTt3QkFDbEI7d0JBQ0EsYUFBYTt3QkFDYmIsUUFBUUY7b0JBQ1osRUFBRSxPQUFNZSxHQUFHO3dCQUNQWixPQUFPWTtvQkFDWDtnQkFDSixHQUNDTixFQUFFLENBQUMsU0FBUyxTQUFTTSxDQUFDO29CQUNuQlosT0FBT1k7Z0JBQ1g7WUFDSjtRQUNKO1FBRUEsT0FBT2Y7SUFDWCxFQUFFLE9BQU1lLEdBQUc7UUFDUCxNQUFNQTtJQUNWO0FBQ0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZW90cmVlLXdlYmVkaXRvci8uL2xpYi9pbWFnZS1zaXplLnRzPzliNzkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGh0dHAgZnJvbSAnbm9kZTpodHRwJztcbmltcG9ydCBodHRwcyBmcm9tICdub2RlOmh0dHBzJztcbmltcG9ydCBzaXplT2YgZnJvbSAnaW1hZ2Utc2l6ZSc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZW1vdGVJbWFnZVNpemUodXJsOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjaHVua3M6IGFueVtdID0gW11cblxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBuZXcgUHJvbWlzZTx7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyOyB9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBfaHR0cCA9IGAke3VybCB8fCAnJ31gLnN1YnN0cmluZygwLCA1KSA9PT0gJ2h0dHBzJyA/IGh0dHBzIDogaHR0cDtcbiAgICAgICAgICAgIF9odHRwLmdldChuZXcgVVJMKHVybCksIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLm9uKCdkYXRhJywgZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgICAgICAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IHNpemVPZihidWZmZXIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZSkgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ2Vycm9yJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJodHRwIiwiaHR0cHMiLCJzaXplT2YiLCJnZXRSZW1vdGVJbWFnZVNpemUiLCJ1cmwiLCJjaHVua3MiLCJyZXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIl9odHRwIiwic3Vic3RyaW5nIiwiZ2V0IiwiVVJMIiwicmVzcG9uc2UiLCJvbiIsImNodW5rIiwicHVzaCIsImJ1ZmZlciIsIkJ1ZmZlciIsImNvbmNhdCIsImUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/image-size.ts\n");

/***/ }),

/***/ "(rsc)/./lib/logger.ts":
/*!***********************!*\
  !*** ./lib/logger.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:fs */ \"node:fs\");\n/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:path */ \"node:path\");\n/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ \"(rsc)/./node_modules/moment/moment.js\");\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nfunction writeLogsToFile(filename, ...args) {\n    const date = moment__WEBPACK_IMPORTED_MODULE_2___default()(new Date()).format(\"YYYYMMDD\");\n    const dir = node_path__WEBPACK_IMPORTED_MODULE_1___default().resolve(`logs/${date}`);\n    if (!node_fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(dir)) node_fs__WEBPACK_IMPORTED_MODULE_0___default().mkdirSync(dir);\n    const data = `${new Date().toUTCString()} ${JSON.stringify([\n        ...args\n    ])}\\n`;\n    const filePath = `${dir}/${filename}`;\n    node_fs__WEBPACK_IMPORTED_MODULE_0___default().appendFileSync(filePath, data);\n}\nconst log = (...args)=>{\n    if (true) {\n        console.log(...args, __filename);\n    }\n    writeLogsToFile(\"logs.txt\", ...args);\n};\nconst error = (...args)=>{\n    if (true) {\n        console.error(...args, __filename);\n    }\n    writeLogsToFile(\"errors.txt\", ...args);\n};\nconst appError = (...args)=>{\n    if (true) {\n        console.error(...args, __filename);\n    }\n    writeLogsToFile(\"app_errors.txt\", ...args);\n};\nconst logger = {\n    log,\n    error,\n    appError\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (logger);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvbG9nZ2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBeUI7QUFDSTtBQUNEO0FBRTVCLFNBQVNHLGdCQUFnQkMsUUFBZ0IsRUFBRSxHQUFHQyxJQUFXO0lBQ3JELE1BQU1DLE9BQU9KLDZDQUFNQSxDQUFDLElBQUlLLFFBQVFDLE1BQU0sQ0FBQztJQUN2QyxNQUFNQyxNQUFNUix3REFBWSxDQUFDLENBQUMsS0FBSyxFQUFFSyxLQUFLLENBQUM7SUFDdkMsSUFBSSxDQUFDTix5REFBYSxDQUFDUyxNQUFNVCx3REFBWSxDQUFDUztJQUN0QyxNQUFNSSxPQUFPLENBQUMsRUFBRSxJQUFJTixPQUFPTyxXQUFXLEdBQUcsQ0FBQyxFQUFFQyxLQUFLQyxTQUFTLENBQUM7V0FBSVg7S0FBSyxFQUFFLEVBQUUsQ0FBQztJQUN6RSxNQUFNWSxXQUFXLENBQUMsRUFBRVIsSUFBSSxDQUFDLEVBQUVMLFNBQVMsQ0FBQztJQUNyQ0osNkRBQWlCLENBQUNpQixVQUFVSjtBQUNoQztBQUVBLE1BQU1NLE1BQTBCLENBQUMsR0FBR2Q7SUFDaEMsSUFBSWUsSUFBeUIsRUFBYztRQUN2Q0MsUUFBUUYsR0FBRyxJQUFJZCxNQUFNaUI7SUFDekI7SUFDQW5CLGdCQUFnQixlQUFlRTtBQUNuQztBQUVBLE1BQU1rQixRQUE4QixDQUFDLEdBQUdsQjtJQUNwQyxJQUFJZSxJQUF5QixFQUFjO1FBQ3ZDQyxRQUFRRSxLQUFLLElBQUlsQixNQUFNaUI7SUFDM0I7SUFDQW5CLGdCQUFnQixpQkFBaUJFO0FBQ3JDO0FBRUEsTUFBTW1CLFdBQWlDLENBQUMsR0FBR25CO0lBQ3ZDLElBQUllLElBQXlCLEVBQWM7UUFDdkNDLFFBQVFFLEtBQUssSUFBSWxCLE1BQU1pQjtJQUMzQjtJQUNBbkIsZ0JBQWdCLHFCQUFxQkU7QUFDekM7QUFFQSxNQUFNb0IsU0FBUztJQUNYTjtJQUNBSTtJQUNBQztBQUNKO0FBRUEsaUVBQWVDLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZW90cmVlLXdlYmVkaXRvci8uL2xpYi9sb2dnZXIudHM/ZmQ1ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuXG5mdW5jdGlvbiB3cml0ZUxvZ3NUb0ZpbGUoZmlsZW5hbWU6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICBjb25zdCBkYXRlID0gbW9tZW50KG5ldyBEYXRlKCkpLmZvcm1hdCgnWVlZWU1NREQnKTtcbiAgICBjb25zdCBkaXIgPSBwYXRoLnJlc29sdmUoYGxvZ3MvJHtkYXRlfWApO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSBmcy5ta2RpclN5bmMoZGlyKTtcbiAgICBjb25zdCBkYXRhID0gYCR7bmV3IERhdGUoKS50b1VUQ1N0cmluZygpfSAke0pTT04uc3RyaW5naWZ5KFsuLi5hcmdzXSl9XFxuYDtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGAke2Rpcn0vJHtmaWxlbmFtZX1gO1xuICAgIGZzLmFwcGVuZEZpbGVTeW5jKGZpbGVQYXRoLCBkYXRhKTtcbn1cblxuY29uc3QgbG9nOiB0eXBlb2YgY29uc29sZS5sb2cgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MsIF9fZmlsZW5hbWUpO1xuICAgIH1cbiAgICB3cml0ZUxvZ3NUb0ZpbGUoJ2xvZ3MudHh0JywgLi4uYXJncyk7XG59O1xuXG5jb25zdCBlcnJvcjogdHlwZW9mIGNvbnNvbGUuZXJyb3IgPSAoLi4uYXJncykgPT4ge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoLi4uYXJncywgX19maWxlbmFtZSk7XG4gICAgfVxuICAgIHdyaXRlTG9nc1RvRmlsZSgnZXJyb3JzLnR4dCcsIC4uLmFyZ3MpO1xufTtcblxuY29uc3QgYXBwRXJyb3I6IHR5cGVvZiBjb25zb2xlLmVycm9yID0gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBjb25zb2xlLmVycm9yKC4uLmFyZ3MsIF9fZmlsZW5hbWUpO1xuICAgIH1cbiAgICB3cml0ZUxvZ3NUb0ZpbGUoJ2FwcF9lcnJvcnMudHh0JywgLi4uYXJncyk7XG59O1xuXG5jb25zdCBsb2dnZXIgPSB7XG4gICAgbG9nLFxuICAgIGVycm9yLFxuICAgIGFwcEVycm9yLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgbG9nZ2VyO1xuIl0sIm5hbWVzIjpbImZzIiwicGF0aCIsIm1vbWVudCIsIndyaXRlTG9nc1RvRmlsZSIsImZpbGVuYW1lIiwiYXJncyIsImRhdGUiLCJEYXRlIiwiZm9ybWF0IiwiZGlyIiwicmVzb2x2ZSIsImV4aXN0c1N5bmMiLCJta2RpclN5bmMiLCJkYXRhIiwidG9VVENTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiZmlsZVBhdGgiLCJhcHBlbmRGaWxlU3luYyIsImxvZyIsInByb2Nlc3MiLCJjb25zb2xlIiwiX19maWxlbmFtZSIsImVycm9yIiwiYXBwRXJyb3IiLCJsb2dnZXIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/logger.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/moment","vendor-chunks/image-size","vendor-chunks/inherits","vendor-chunks/queue"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffiles%2Fget-image-size%2Froute&page=%2Fapi%2Ffiles%2Fget-image-size%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffiles%2Fget-image-size%2Froute.ts&appDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Ffarai%2FWorkbench%2FNeotree%2Fneotree-editor&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();